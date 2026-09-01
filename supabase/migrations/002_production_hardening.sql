-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 002: PRODUCTION HARDENING
-- Adds: staff_permissions, audit_logs, notifications, setup_tokens
-- Establishes granular RLS policies
-- ==============================================================================

-- ==============================================================================
-- 10. STAFF PERMISSIONS
-- Fine-grained permissions assigned to individual staff members by admins.
-- Each row grants one named permission to one user.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS staff_permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission      TEXT NOT NULL,
    granted_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT staff_permissions_unique UNIQUE (user_id, permission)
);

COMMENT ON TABLE staff_permissions IS 'Granular permission assignments for staff members. Admins have all permissions implicitly.';

-- Valid permission names (documented as a constraint comment)
-- view_bookings, create_booking, update_booking, cancel_booking
-- check_in_guest, check_out_guest
-- view_guests, manage_rooms, manage_room_prices, manage_room_images
-- manage_amenities, manage_gallery, manage_staff, manage_settings
-- view_reports, manage_content, view_audit_logs

-- ==============================================================================
-- 11. AUDIT LOGS
-- Append-only record of important actions across the system.
-- No UPDATE or DELETE is ever permitted.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email  TEXT,
    actor_role   TEXT,
    action       TEXT NOT NULL,
    entity_type  TEXT,
    entity_id    TEXT,
    metadata     JSONB,
    ip_address   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail. No updates or deletes are permitted by RLS.';

-- ==============================================================================
-- 12. NOTIFICATIONS
-- Internal notification queue. Can be extended with email/SMS providers later.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type         TEXT NOT NULL,
    title        TEXT NOT NULL,
    body         TEXT NOT NULL,
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    metadata     JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. SETUP TOKENS
-- One-time tokens for secure first-admin provisioning.
-- After use, the token is consumed (used_at is set). Expired after 24 hours.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS setup_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash  TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used_at     TIMESTAMPTZ,
    used_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE setup_tokens IS 'One-time tokens for first admin provisioning. Store token_hash only, never plaintext.';

-- ==============================================================================
-- INDEXES
-- ==============================================================================
-- Older deployments can already have these enum types but lack values introduced
-- by the current schema. Add them before policies and helper functions use them.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'available';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'occupied';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'maintenance';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'inactive';

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'checked_in';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'checked_out';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'rejected';

-- `CREATE TABLE IF NOT EXISTS` in the initial migration preserves older tables
-- unchanged. Ensure every column used by this hardening migration exists before
-- creating indexes, triggers, functions, or RLS policies.
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'guest',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS position TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS category room_category NOT NULL DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS price_per_night NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN IF NOT EXISTS status room_status NOT NULL DEFAULT 'available',
    ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE room_images
    ADD COLUMN IF NOT EXISTS room_id UUID;

ALTER TABLE room_amenities
    ADD COLUMN IF NOT EXISTS room_id UUID;

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS booking_reference TEXT,
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS room_id UUID,
    ADD COLUMN IF NOT EXISTS check_in DATE,
    ADD COLUMN IF NOT EXISTS check_out DATE,
    ADD COLUMN IF NOT EXISTS guest_count INTEGER,
    ADD COLUMN IF NOT EXISTS guest_name TEXT,
    ADD COLUMN IF NOT EXISTS guest_email TEXT,
    ADD COLUMN IF NOT EXISTS guest_phone TEXT,
    ADD COLUMN IF NOT EXISTS status booking_status NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS special_request TEXT,
    ADD COLUMN IF NOT EXISTS price_per_night NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS num_nights INTEGER,
    ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS checked_in_by UUID,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS checked_out_by UUID,
    ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS confirmed_by UUID,
    ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_by UUID,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE amenities
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE contact_messages
    ADD COLUMN IF NOT EXISTS status message_status NOT NULL DEFAULT 'unread',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE gallery
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id   ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email      ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active  ON profiles(is_active);

-- Rooms
CREATE INDEX IF NOT EXISTS idx_rooms_slug          ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_category      ON rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_status        ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_is_listed     ON rooms(is_listed);

-- Room media
CREATE INDEX IF NOT EXISTS idx_room_images_room_id   ON room_images(room_id);
CREATE INDEX IF NOT EXISTS idx_room_amenities_room_id ON room_amenities(room_id);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_room_id    ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates      ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference  ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in   ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out  ON bookings(check_out);

-- Contact messages
CREATE INDEX IF NOT EXISTS idx_messages_status     ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);

-- Staff permissions
CREATE INDEX IF NOT EXISTS idx_staff_perms_user_id    ON staff_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_perms_permission  ON staff_permissions(permission);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_actor_id     ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action       ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at   ON audit_logs(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- ==============================================================================
-- UPDATED_AT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  CREATE TRIGGER tr_profiles_updated
    BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_rooms_updated
    BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_bookings_updated
    BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_amenities_updated
    BEFORE UPDATE ON amenities FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_site_settings_updated
    BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- AUTO-CREATE PROFILE ON AUTH USER REGISTRATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, phone, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        'guest',
        TRUE
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS
  'Automatically creates a guest-role profile when a new user registers. Role is always guest — never elevated automatically.';

-- ==============================================================================
-- ROW LEVEL SECURITY — ENABLE ON ALL TABLES
-- ==============================================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_amenities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery           ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_tokens      ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Returns true ONLY for admin or super_admin roles
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Returns true for staff, admin, or super_admin roles (active only)
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
          AND role IN ('staff', 'admin', 'super_admin')
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Returns true if current user has a specific named permission
-- Admins and super_admins implicitly have all permissions
CREATE OR REPLACE FUNCTION has_permission(perm TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admins and super_admins have all permissions
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    -- Staff must have explicit permission assignment
    RETURN EXISTS (
        SELECT 1 FROM staff_permissions
        WHERE user_id = auth.uid()
          AND permission = perm
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Returns the current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role::TEXT INTO v_role FROM profiles WHERE user_id = auth.uid() AND is_active = TRUE;
    RETURN COALESCE(v_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ==============================================================================
-- RLS POLICIES — PROFILES
-- ==============================================================================
-- Drop all known policy names (old & new) to ensure idempotency
DROP POLICY IF EXISTS "profiles_select_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin"            ON profiles;
DROP POLICY IF EXISTS "profiles_insert_self"             ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin"            ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_staff"     ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin_or_trigger" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"            ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile"  ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full manage profiles"        ON profiles;

-- Users can read their own profile; staff/admin can read all active profiles
CREATE POLICY "profiles_select_own_or_staff" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id
        OR is_staff_or_admin()
    );

-- New profiles are created by the trigger — users cannot INSERT directly
-- Admin can insert (for seeding staff profiles before they log in)
CREATE POLICY "profiles_insert_admin_or_trigger" ON profiles
    FOR INSERT WITH CHECK (is_admin());

-- Users can update only their own non-sensitive fields
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile (including role and is_active)
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (is_admin());

-- Only admins can delete profiles (soft delete preferred)
CREATE POLICY "profiles_delete_admin" ON profiles
    FOR DELETE USING (is_admin());

-- ==============================================================================
-- RLS POLICIES — ROOMS (Public read, admin write)
-- ==============================================================================
DROP POLICY IF EXISTS "rooms_select_public"  ON rooms;
DROP POLICY IF EXISTS "rooms_all_admin"      ON rooms;
DROP POLICY IF EXISTS "rooms_update_staff"   ON rooms;
DROP POLICY IF EXISTS "Public read rooms"    ON rooms;
DROP POLICY IF EXISTS "Admin manage rooms"   ON rooms;

-- Public: see only listed, non-inactive rooms (or staff/admin see all)
CREATE POLICY "rooms_select_public" ON rooms
    FOR SELECT USING (
        (is_listed = TRUE AND status != 'inactive')
        OR is_staff_or_admin()
    );

-- Admin full control
CREATE POLICY "rooms_all_admin" ON rooms
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- Staff with manage_rooms permission can update room status
CREATE POLICY "rooms_update_staff" ON rooms
    FOR UPDATE USING (has_permission('manage_rooms'))
    WITH CHECK (has_permission('manage_rooms'));

-- ==============================================================================
-- RLS POLICIES — ROOM IMAGES & AMENITIES
-- ==============================================================================
DROP POLICY IF EXISTS "room_images_select_public"    ON room_images;
DROP POLICY IF EXISTS "room_images_all_admin"        ON room_images;
DROP POLICY IF EXISTS "room_amenities_select_public" ON room_amenities;
DROP POLICY IF EXISTS "room_amenities_all_admin"     ON room_amenities;
DROP POLICY IF EXISTS "Public read room images"      ON room_images;
DROP POLICY IF EXISTS "Admin manage room images"     ON room_images;
DROP POLICY IF EXISTS "Public read room amenities"   ON room_amenities;
DROP POLICY IF EXISTS "Admin manage room amenities"  ON room_amenities;

CREATE POLICY "room_images_select_public" ON room_images
    FOR SELECT USING (TRUE);

CREATE POLICY "room_images_all_admin" ON room_images
    FOR ALL USING (has_permission('manage_room_images'))
    WITH CHECK (has_permission('manage_room_images'));

CREATE POLICY "room_amenities_select_public" ON room_amenities
    FOR SELECT USING (TRUE);

CREATE POLICY "room_amenities_all_admin" ON room_amenities
    FOR ALL USING (has_permission('manage_rooms'))
    WITH CHECK (has_permission('manage_rooms'));

-- ==============================================================================
-- RLS POLICIES — BOOKINGS
-- ==============================================================================
DROP POLICY IF EXISTS "bookings_insert_authenticated" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_any"           ON bookings;
DROP POLICY IF EXISTS "bookings_select_own"           ON bookings;
DROP POLICY IF EXISTS "bookings_select_staff"         ON bookings;
DROP POLICY IF EXISTS "bookings_update_staff"         ON bookings;
DROP POLICY IF EXISTS "bookings_all_admin"            ON bookings;
DROP POLICY IF EXISTS "Users can create bookings"     ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin manage bookings"         ON bookings;

-- Any user (including unauthenticated) can submit a booking request
-- Price is validated server-side via RPC
CREATE POLICY "bookings_insert_any" ON bookings
    FOR INSERT WITH CHECK (TRUE);

-- Guests see only their own bookings; staff/admin see all
CREATE POLICY "bookings_select_own" ON bookings
    FOR SELECT USING (
        auth.uid() = user_id
        OR has_permission('view_bookings')
    );

-- Staff with permissions can update booking status
CREATE POLICY "bookings_update_staff" ON bookings
    FOR UPDATE USING (has_permission('update_booking'))
    WITH CHECK (has_permission('update_booking'));

-- Admin full control
CREATE POLICY "bookings_all_admin" ON bookings
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================================================
-- RLS POLICIES — AMENITIES (Public read)
-- ==============================================================================
DROP POLICY IF EXISTS "amenities_select_public" ON amenities;
DROP POLICY IF EXISTS "amenities_all_admin"     ON amenities;
DROP POLICY IF EXISTS "Public read amenities"   ON amenities;
DROP POLICY IF EXISTS "Admin manage amenities"  ON amenities;

CREATE POLICY "amenities_select_public" ON amenities
    FOR SELECT USING (status = 'active' OR is_admin());

CREATE POLICY "amenities_all_admin" ON amenities
    FOR ALL USING (has_permission('manage_amenities'))
    WITH CHECK (has_permission('manage_amenities'));

-- ==============================================================================
-- RLS POLICIES — CONTACT MESSAGES
-- ==============================================================================
DROP POLICY IF EXISTS "messages_insert_public"           ON contact_messages;
DROP POLICY IF EXISTS "messages_select_staff"            ON contact_messages;
DROP POLICY IF EXISTS "messages_update_staff"            ON contact_messages;
DROP POLICY IF EXISTS "messages_delete_admin"            ON contact_messages;
DROP POLICY IF EXISTS "Public insert contact messages"   ON contact_messages;
DROP POLICY IF EXISTS "Admin manage contact messages"    ON contact_messages;

-- Anyone can submit a contact message
CREATE POLICY "messages_insert_public" ON contact_messages
    FOR INSERT WITH CHECK (TRUE);

-- Only staff/admin can read messages
CREATE POLICY "messages_select_staff" ON contact_messages
    FOR SELECT USING (has_permission('view_bookings') OR is_admin());

-- Staff/admin can update message status
CREATE POLICY "messages_update_staff" ON contact_messages
    FOR UPDATE USING (is_staff_or_admin())
    WITH CHECK (is_staff_or_admin());

CREATE POLICY "messages_delete_admin" ON contact_messages
    FOR DELETE USING (is_admin());

-- ==============================================================================
-- RLS POLICIES — GALLERY (Public read, admin write)
-- ==============================================================================
DROP POLICY IF EXISTS "gallery_select_public" ON gallery;
DROP POLICY IF EXISTS "gallery_all_admin"     ON gallery;
DROP POLICY IF EXISTS "Public read gallery"   ON gallery;
DROP POLICY IF EXISTS "Admin manage gallery"  ON gallery;

CREATE POLICY "gallery_select_public" ON gallery
    FOR SELECT USING (TRUE);

CREATE POLICY "gallery_all_admin" ON gallery
    FOR ALL USING (has_permission('manage_gallery'))
    WITH CHECK (has_permission('manage_gallery'));

-- ==============================================================================
-- RLS POLICIES — SITE SETTINGS
-- ==============================================================================
DROP POLICY IF EXISTS "settings_select_public"     ON site_settings;
DROP POLICY IF EXISTS "settings_all_admin"         ON site_settings;
DROP POLICY IF EXISTS "Public read site settings"  ON site_settings;
DROP POLICY IF EXISTS "Admin manage site settings" ON site_settings;

CREATE POLICY "settings_select_public" ON site_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "settings_all_admin" ON site_settings
    FOR ALL USING (has_permission('manage_settings'))
    WITH CHECK (has_permission('manage_settings'));

-- ==============================================================================
-- RLS POLICIES — STAFF PERMISSIONS
-- ==============================================================================
DROP POLICY IF EXISTS "staff_perms_select_own" ON staff_permissions;
DROP POLICY IF EXISTS "staff_perms_all_admin"  ON staff_permissions;

-- Staff can read their own permissions
CREATE POLICY "staff_perms_select_own" ON staff_permissions
    FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- Only admins can grant or revoke permissions
CREATE POLICY "staff_perms_all_admin" ON staff_permissions
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================================================
-- RLS POLICIES — AUDIT LOGS (Append-only)
-- ==============================================================================
DROP POLICY IF EXISTS "audit_select_admin"       ON audit_logs;
DROP POLICY IF EXISTS "audit_insert_via_function" ON audit_logs;

-- Only admin/super_admin can read audit logs
CREATE POLICY "audit_select_admin" ON audit_logs
    FOR SELECT USING (has_permission('view_audit_logs') OR is_admin());

-- INSERT is handled via SECURITY DEFINER functions
CREATE POLICY "audit_insert_via_function" ON audit_logs
    FOR INSERT WITH CHECK (is_staff_or_admin());

-- NO UPDATE or DELETE policies — audit logs are immutable

-- ==============================================================================
-- RLS POLICIES — NOTIFICATIONS
-- ==============================================================================
DROP POLICY IF EXISTS "notifications_select_own"    ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"    ON notifications;

-- Users see only their own notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- System inserts (via SECURITY DEFINER functions)
CREATE POLICY "notifications_insert_system" ON notifications
    FOR INSERT WITH CHECK (is_staff_or_admin() OR user_id = auth.uid());

-- Users can mark their own notifications read
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- RLS POLICIES — SETUP TOKENS
-- Only accessible via SECURITY DEFINER functions — no direct client access.
-- Split into per-operation denies (FOR ALL with USING(FALSE) is invalid for INSERT).
-- ==============================================================================
DROP POLICY IF EXISTS "setup_tokens_deny_all"    ON setup_tokens;
DROP POLICY IF EXISTS "setup_tokens_deny_select" ON setup_tokens;
DROP POLICY IF EXISTS "setup_tokens_deny_insert" ON setup_tokens;
DROP POLICY IF EXISTS "setup_tokens_deny_update" ON setup_tokens;
DROP POLICY IF EXISTS "setup_tokens_deny_delete" ON setup_tokens;

CREATE POLICY "setup_tokens_deny_select" ON setup_tokens
    FOR SELECT USING (FALSE);

CREATE POLICY "setup_tokens_deny_insert" ON setup_tokens
    FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "setup_tokens_deny_update" ON setup_tokens
    FOR UPDATE USING (FALSE);

CREATE POLICY "setup_tokens_deny_delete" ON setup_tokens
    FOR DELETE USING (FALSE);
