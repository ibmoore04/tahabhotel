-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 002: SECURITY RLS & AUTHORIZATION HARDENING
-- ==============================================================================
-- CRITICAL SECURITY MIGRATION - ENABLES RLS ON ALL PROTECTED TABLES
--
-- This migration enforces database-level authorization that cannot be bypassed
-- by manipulating frontend state, JWT claims, or direct API calls.
--
-- ROLE HIERARCHY (enforced by database):
--   guest      - Public website users with personal booking access
--   staff      - Hotel operations staff
--   admin      - Hotel administrators
--   super_admin - Full system administration
--
-- IMPORTANT: This migration is idempotent and safe to run against existing data.
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: SECURITY HELPER FUNCTIONS
-- ==============================================================================
-- These functions provide secure, database-side authorization checks.
-- SECURITY DEFINER is used to query profiles without triggering RLS recursion.
-- search_path is explicitly set to prevent SQL injection via schema manipulation.

/**
 * Get the current user's profile role.
 * Returns NULL if no authenticated user, no profile, or profile is inactive.
 */
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    current_role user_role;
BEGIN
    SELECT role INTO current_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN current_role;
END;
$$;

/**
 * Check if the current user is active.
 * Returns TRUE only if user has an active profile.
 */
CREATE OR REPLACE FUNCTION is_current_user_active()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_active BOOLEAN;
BEGIN
    SELECT is_active INTO user_active
    FROM profiles
    WHERE user_id = auth.uid();

    RETURN COALESCE(user_active, FALSE);
END;
$$;

/**
 * Check if the current user is staff or higher (staff, admin, super_admin).
 * Returns FALSE for guests, anon users, or inactive users.
 */
CREATE OR REPLACE FUNCTION is_current_user_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role IN ('staff', 'admin', 'super_admin');
END;
$$;

/**
 * Check if the current user is admin or super_admin.
 */
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role IN ('admin', 'super_admin');
END;
$$;

/**
 * Check if the current user is super_admin.
 */
CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role = 'super_admin';
END;
$$;

/**
 * Get the current user's profile ID.
 * Returns NULL if no profile found.
 */
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    profile_id UUID;
BEGIN
    SELECT id INTO profile_id
    FROM profiles
    WHERE user_id = auth.uid();

    RETURN profile_id;
END;
$$;

-- ==============================================================================
-- SECTION 2: ROLE ESCALATION PROTECTION
-- ==============================================================================
-- Prevents users from modifying their own role or is_active status.
-- Prevents non-super_admins from creating or modifying elevated roles.
-- Covers both UPDATE and INSERT operations.

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_role user_role;
    is_super_admin_val BOOLEAN;
    is_first_admin_bootstrap BOOLEAN;
BEGIN
    -- Get the current user's role from the database
    SELECT role INTO current_user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    -- Bootstrap case: allow handle_new_user() to create the initial guest profile
    IF current_user_role IS NULL AND TG_OP = 'INSERT' AND NEW.role = 'guest' THEN
        RETURN NEW;
    END IF;

    -- If no active profile found, user cannot modify roles
    IF current_user_role IS NULL THEN
        RAISE EXCEPTION 'Only active authenticated users can modify profiles.';
    END IF;

    is_super_admin_val := (current_user_role = 'super_admin');

    -- Detect first-admin bootstrap scenario
    is_first_admin_bootstrap := (
        TG_OP = 'UPDATE'
        AND OLD.user_id = auth.uid()
        AND current_user_role = 'guest'
        AND NEW.role IN ('admin', 'super_admin')
        AND NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE role IN ('admin', 'super_admin')
              AND user_id != auth.uid()
        )
    );

    -- For UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        -- Normal self-role-change block
        IF OLD.user_id = auth.uid() THEN
            IF NEW.role IS DISTINCT FROM OLD.role THEN
                IF NOT is_first_admin_bootstrap THEN
                    RAISE EXCEPTION 'You cannot change your own role.';
                END IF;
            END IF;
            IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
                RAISE EXCEPTION 'You cannot change your own active status.';
            END IF;
        END IF;

        -- Prevent demoting a super_admin by non-super_admin
        IF OLD.role = 'super_admin' AND NEW.role != 'super_admin' AND NOT is_super_admin_val THEN
            RAISE EXCEPTION 'Only super administrators can modify super admin accounts.';
        END IF;
    END IF;

    -- For INSERT operations: prevent creation of elevated roles
    IF TG_OP = 'INSERT' THEN
        -- Only super_admin can create admin or super_admin accounts
        IF NEW.role IN ('admin', 'super_admin') AND NOT is_super_admin_val THEN
            RAISE EXCEPTION 'Only super administrators can create elevated role accounts.';
        END IF;

        -- Only super_admin can create super_admin accounts
        IF NEW.role = 'super_admin' AND NOT is_super_admin_val THEN
            RAISE EXCEPTION 'Only super administrators can create super admin accounts.';
        END IF;

        -- Guests and staff can only create guest profiles
        IF current_user_role IN ('guest', 'staff') AND NEW.role != 'guest' THEN
            RAISE EXCEPTION 'Only administrators can create non-guest profiles.';
        END IF;
    END IF;

    -- Only super_admin can assign admin or super_admin roles
    -- Exception: first-admin bootstrap
    IF NEW.role IN ('admin', 'super_admin') AND NOT is_super_admin_val THEN
        IF NOT is_first_admin_bootstrap THEN
            RAISE EXCEPTION 'Only super administrators can assign elevated roles.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create the trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_prevent_role_escalation_update ON profiles;
CREATE TRIGGER trigger_prevent_role_escalation_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

-- Create the trigger for INSERT
DROP TRIGGER IF EXISTS trigger_prevent_role_escalation_insert ON profiles;
CREATE TRIGGER trigger_prevent_role_escalation_insert
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

-- ==============================================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- ==============================================================================

-- Enable RLS on all protected tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Force RLS for profiles even for table owners
-- This ensures the trigger and all operations go through RLS policies
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- SECTION 4: PROFILES POLICIES
-- ==============================================================================
-- These policies are already created by the initial/hardening migration.
-- Do NOT recreate them here to avoid duplicate-policy errors.
-- Expected existing policies:
--   profiles_select_own, profiles_select_own_or_staff, profiles_select_staff,
--   profiles_update_own, profiles_update_admin, profiles_update_super_admin,
--   profiles_delete, profiles_delete_admin, profiles_insert_admin_or_trigger
-- ==============================================================================

-- NOTE: No INSERT policy for profiles.
-- Profile creation is handled exclusively by the handle_new_user() trigger
-- on auth.users, which runs as SECURITY DEFINER and bypasses RLS.
-- This prevents users from creating arbitrary or privileged profiles.

-- ==============================================================================
-- SECTION 5: BOOKINGS POLICIES
-- ==============================================================================
-- Guests can only access their own bookings.
-- Staff and above can access all bookings for operational purposes.
-- Price and status are controlled by RPC functions, not client input.

-- Policy: Guests can view their own bookings; staff/admin can view all
-- Combined into one policy because PostgREST ANDs multiple policies together,
-- which would block guests from seeing their own bookings.
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_select_staff" ON bookings;
DROP POLICY IF EXISTS bookings_select_own ON bookings;
DROP POLICY IF EXISTS bookings_select_staff ON bookings;
DROP POLICY IF EXISTS bookings_select ON bookings;
CREATE POLICY bookings_select
    ON bookings
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_current_user_staff_or_admin()
    );

-- Policy: Authenticated users can create bookings
-- The RPC function calculates price server-side
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS bookings_insert ON bookings;
DROP POLICY IF EXISTS bookings_insert ON bookings;
CREATE POLICY bookings_insert
    ON bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR is_current_user_staff_or_admin()
    );

-- Policy: Only staff/admin can update bookings
-- Status changes are enforced by the transition_booking_status RPC
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS bookings_update ON bookings;
DROP POLICY IF EXISTS bookings_update ON bookings;
CREATE POLICY bookings_update
    ON bookings
    FOR UPDATE
    TO authenticated
    USING (is_current_user_staff_or_admin())
    WITH CHECK (is_current_user_staff_or_admin());

-- Policy: No direct deletes - bookings are cancelled, not deleted
-- Only super_admin can delete (for data cleanup)
DROP POLICY IF EXISTS "bookings_delete" ON bookings;
DROP POLICY IF EXISTS bookings_delete ON bookings;
DROP POLICY IF EXISTS bookings_delete ON bookings;
CREATE POLICY bookings_delete
    ON bookings
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- ==============================================================================
-- SECTION 6: ROOMS POLICIES
-- ==============================================================================

-- Policy: Anyone can read listed, active rooms (public website)
-- Staff/admin can read all rooms. Combined into one policy because PostgREST
-- ANDs multiple policies together, which would otherwise block public reads.
DROP POLICY IF EXISTS "rooms_select_public" ON rooms;
DROP POLICY IF EXISTS "rooms_all_admin" ON rooms;
DROP POLICY IF EXISTS "rooms_update_staff" ON rooms;
DROP POLICY IF EXISTS rooms_select_public ON rooms;
DROP POLICY IF EXISTS rooms_select_staff ON rooms;
DROP POLICY IF EXISTS "rooms_select" ON rooms;
DROP POLICY IF EXISTS rooms_select ON rooms;
CREATE POLICY rooms_select
    ON rooms
    FOR SELECT
    USING (
        (is_listed = TRUE AND status != 'inactive')
        OR is_current_user_staff_or_admin()
    );

-- Policy: Only admin can create rooms
DROP POLICY IF EXISTS "rooms_insert" ON rooms;
DROP POLICY IF EXISTS rooms_insert ON rooms;
CREATE POLICY rooms_insert
    ON rooms
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

-- Policy: Only admin can update rooms
DROP POLICY IF EXISTS "rooms_update" ON rooms;
DROP POLICY IF EXISTS rooms_update ON rooms;
CREATE POLICY rooms_update
    ON rooms
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

-- Policy: Only super_admin can delete rooms
DROP POLICY IF EXISTS "rooms_delete" ON rooms;
DROP POLICY IF EXISTS rooms_delete ON rooms;
CREATE POLICY rooms_delete
    ON rooms
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- ==============================================================================
-- SECTION 7: ROOM IMAGES POLICIES
-- ==============================================================================

-- Policy: Anyone can read images of listed rooms
-- Staff/admin can read all room images. Combined into one policy because
-- PostgREST ANDs multiple policies together.
DROP POLICY IF EXISTS "room_images_select_public" ON room_images;
DROP POLICY IF EXISTS "room_images_all_admin" ON room_images;
DROP POLICY IF EXISTS room_images_select_public ON room_images;
DROP POLICY IF EXISTS room_images_select_staff ON room_images;
DROP POLICY IF EXISTS "room_images_select" ON room_images;
DROP POLICY IF EXISTS room_images_select ON room_images;
CREATE POLICY room_images_select
    ON room_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = room_images.room_id
              AND rooms.is_listed = TRUE
        )
        OR is_current_user_staff_or_admin()
    );

-- Policy: Only admin can manage room images
DROP POLICY IF EXISTS "room_images_insert" ON room_images;
DROP POLICY IF EXISTS room_images_insert ON room_images;
CREATE POLICY room_images_insert
    ON room_images
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "room_images_update" ON room_images;
DROP POLICY IF EXISTS room_images_update ON room_images;
CREATE POLICY room_images_update
    ON room_images
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "room_images_delete" ON room_images;
DROP POLICY IF EXISTS room_images_delete ON room_images;
CREATE POLICY room_images_delete
    ON room_images
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 8: ROOM AMENITIES POLICIES
-- ==============================================================================

-- Policy: Anyone can read amenities of listed rooms
-- Staff/admin can read all room amenities. Combined into one policy because
-- PostgREST ANDs multiple policies together.
DROP POLICY IF EXISTS "room_amenities_select_public" ON room_amenities;
DROP POLICY IF EXISTS "room_amenities_select_staff" ON room_amenities;
DROP POLICY IF EXISTS room_amenities_select_public ON room_amenities;
DROP POLICY IF EXISTS room_amenities_select_staff ON room_amenities;
DROP POLICY IF EXISTS "room_amenities_select" ON room_amenities;
DROP POLICY IF EXISTS room_amenities_select ON room_amenities;
CREATE POLICY room_amenities_select
    ON room_amenities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = room_amenities.room_id
              AND rooms.is_listed = TRUE
        )
        OR is_current_user_staff_or_admin()
    );

-- Policy: Only admin can manage room amenities
DROP POLICY IF EXISTS "room_amenities_insert" ON room_amenities;
DROP POLICY IF EXISTS room_amenities_insert ON room_amenities;
CREATE POLICY room_amenities_insert
    ON room_amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "room_amenities_delete" ON room_amenities;
DROP POLICY IF EXISTS room_amenities_delete ON room_amenities;
CREATE POLICY room_amenities_delete
    ON room_amenities
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 9: AMENITIES POLICIES
-- ==============================================================================

-- Policy: Anyone can read active amenities
-- Staff/admin can read all amenities. Combined into one policy because
-- PostgREST ANDs multiple policies together.
DROP POLICY IF EXISTS "amenities_select_public" ON amenities;
DROP POLICY IF EXISTS "amenities_select_staff" ON amenities;
DROP POLICY IF EXISTS amenities_select_public ON amenities;
DROP POLICY IF EXISTS amenities_select_staff ON amenities;
DROP POLICY IF EXISTS "amenities_select" ON amenities;
DROP POLICY IF EXISTS amenities_select ON amenities;
CREATE POLICY amenities_select
    ON amenities
    FOR SELECT
    USING (
        status = 'active'
        OR is_current_user_staff_or_admin()
    );

-- Policy: Only admin can manage amenities
DROP POLICY IF EXISTS "amenities_insert" ON amenities;
DROP POLICY IF EXISTS amenities_insert ON amenities;
CREATE POLICY amenities_insert
    ON amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "amenities_update" ON amenities;
DROP POLICY IF EXISTS amenities_update ON amenities;
CREATE POLICY amenities_update
    ON amenities
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "amenities_delete" ON amenities;
DROP POLICY IF EXISTS amenities_delete ON amenities;
CREATE POLICY amenities_delete
    ON amenities
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 10: GALLERY POLICIES
-- ==============================================================================

-- Policy: Anyone can read gallery items
-- Staff/admin can read all gallery items. Combined into one policy because
-- PostgREST ANDs multiple policies together.
DROP POLICY IF EXISTS "gallery_select_public" ON gallery;
DROP POLICY IF EXISTS gallery_select_public ON gallery;
DROP POLICY IF EXISTS "gallery_select" ON gallery;
DROP POLICY IF EXISTS gallery_select ON gallery;
CREATE POLICY gallery_select
    ON gallery
    FOR SELECT
    USING (TRUE);

-- Policy: Only admin can manage gallery
DROP POLICY IF EXISTS "gallery_insert" ON gallery;
DROP POLICY IF EXISTS gallery_insert ON gallery;
CREATE POLICY gallery_insert
    ON gallery
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "gallery_update" ON gallery;
DROP POLICY IF EXISTS gallery_update ON gallery;
CREATE POLICY gallery_update
    ON gallery
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "gallery_delete" ON gallery;
DROP POLICY IF EXISTS gallery_delete ON gallery;
CREATE POLICY gallery_delete
    ON gallery
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 11: CONTACT MESSAGES POLICIES
-- ==============================================================================

-- Policy: Anyone can insert contact messages (public form)
DROP POLICY IF EXISTS "contact_messages_insert_public" ON contact_messages;
DROP POLICY IF EXISTS contact_messages_insert_public ON contact_messages;
CREATE POLICY contact_messages_insert_public
    ON contact_messages
    FOR INSERT
    TO public
    WITH CHECK (TRUE);

-- Policy: Staff and above can read contact messages
DROP POLICY IF EXISTS "contact_messages_select" ON contact_messages;
DROP POLICY IF EXISTS contact_messages_select ON contact_messages;
CREATE POLICY contact_messages_select
    ON contact_messages
    FOR SELECT
    TO authenticated
    USING (is_current_user_staff_or_admin());

-- Policy: Staff and above can update contact messages (mark as read, etc.)
DROP POLICY IF EXISTS "contact_messages_update" ON contact_messages;
DROP POLICY IF EXISTS contact_messages_update ON contact_messages;
CREATE POLICY contact_messages_update
    ON contact_messages
    FOR UPDATE
    TO authenticated
    USING (is_current_user_staff_or_admin())
    WITH CHECK (is_current_user_staff_or_admin());

-- Policy: Only admin can delete contact messages
DROP POLICY IF EXISTS "contact_messages_delete" ON contact_messages;
DROP POLICY IF EXISTS contact_messages_delete ON contact_messages;
CREATE POLICY contact_messages_delete
    ON contact_messages
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 12: SITE SETTINGS POLICIES
-- ==============================================================================

-- Policy: Anyone can read site settings (for public website configuration)
-- Staff/admin can read all settings. Combined into one policy because
-- PostgREST ANDs multiple policies together.
DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
DROP POLICY IF EXISTS site_settings_select_public ON site_settings;
DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
DROP POLICY IF EXISTS site_settings_select ON site_settings;
CREATE POLICY site_settings_select
    ON site_settings
    FOR SELECT
    USING (TRUE);

-- Policy: Only admin can manage site settings
DROP POLICY IF EXISTS "site_settings_insert" ON site_settings;
DROP POLICY IF EXISTS site_settings_insert ON site_settings;
CREATE POLICY site_settings_insert
    ON site_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "site_settings_update" ON site_settings;
DROP POLICY IF EXISTS site_settings_update ON site_settings;
CREATE POLICY site_settings_update
    ON site_settings
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "site_settings_delete" ON site_settings;
DROP POLICY IF EXISTS site_settings_delete ON site_settings;
CREATE POLICY site_settings_delete
    ON site_settings
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin());

-- ==============================================================================
-- SECTION 13: PERFORMANCE INDEXES FOR RLS
-- ==============================================================================
-- Indexes to support common RLS policy filters and application queries

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

-- Room images indexes
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);

-- Room amenities indexes
CREATE INDEX IF NOT EXISTS idx_room_amenities_room_id ON room_amenities(room_id);

-- Amenities indexes
CREATE INDEX IF NOT EXISTS idx_amenities_status ON amenities(status);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Gallery indexes
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);

-- Ensure profiles.user_id is unique to prevent 406 errors from duplicate rows
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles(user_id) WHERE user_id IS NOT NULL;

-- ==============================================================================
-- SECTION 14: REPAIR EXISTING AUTH USERS WITHOUT PROFILES
-- ==============================================================================
-- Safe repair function: creates exactly one missing profile for each auth user
-- that does not already have one. Safe to run multiple times.

CREATE OR REPLACE FUNCTION repair_missing_profiles()
RETURNS TEXT AS $$
DECLARE
    v_created INTEGER := 0;
    v_skipped INTEGER := 0;
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, phone, role, is_active)
    SELECT
        au.id,
        COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
        au.email,
        NULLIF(au.raw_user_meta_data->>'phone', ''),
        'guest',
        TRUE
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE p.id IS NULL
    ON CONFLICT (user_id) DO NOTHING;

    GET DIAGNOSTICS v_created = ROW_COUNT;

    SELECT COUNT(*) INTO v_skipped
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE p.id IS NULL;

    RETURN format('Repair complete. Created: %s, Still missing: %s', v_created, v_skipped);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION repair_missing_profiles() TO authenticated;

COMMENT ON FUNCTION repair_missing_profiles() IS
  'One-time repair for auth users missing profiles. Run in Supabase SQL editor if needed.';

-- ==============================================================================
-- SECTION 14: SECURE RPC FUNCTION PERMISSIONS
-- ==============================================================================
-- Grant EXECUTE only to authenticated users.
-- The helper functions use auth.uid() which requires authentication.
-- Do NOT grant to anon - these functions are meaningless without authentication.

GRANT EXECUTE ON FUNCTION get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_active TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_staff_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_profile_id TO authenticated;

-- The trigger functions should not be directly callable by users
-- They are automatically invoked by the database

-- ==============================================================================
-- SECTION 15: PROFILE AUTO-CREATION TRIGGER
-- ==============================================================================
-- Automatically create a profile when a new user signs up via Supabase Auth.
-- This ensures every auth user has a profile with 'guest' role.
-- The trigger runs as SECURITY DEFINER to bypass RLS during creation.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (user_id, full_name, email, phone, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        'guest',
        TRUE
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- audit_logs table already created by 002_production_hardening.sql.
-- Add any missing columns so this migration remains idempotent and compatible.
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS actor_email TEXT,
    ADD COLUMN IF NOT EXISTS actor_role TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Enable RLS on audit_logs (safe to repeat)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and super_admins can view audit logs
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (is_current_user_admin());

-- Only super_admin can delete audit logs
DROP POLICY IF EXISTS "audit_logs_delete" ON audit_logs;
DROP POLICY IF EXISTS audit_logs_delete ON audit_logs;
CREATE POLICY audit_logs_delete
    ON audit_logs
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id     ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action       ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type  ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs(created_at DESC);

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Summary of changes:
-- 1. Created 6 security helper functions for role checking (SECURITY DEFINER)
-- 2. Created role escalation prevention trigger for both INSERT and UPDATE
-- 3. Enabled RLS on 9 tables + force RLS on profiles
-- 4. Added/refreshed policies for bookings, rooms, room_images, room_amenities,
--    amenities, gallery, contact_messages, site_settings, and audit_logs
-- 5. Added 17+ performance indexes
-- 6. Secured RPC function permissions (authenticated only, no anon grants)
-- 7. Added auto-profile creation trigger (role always 'guest')
-- 8. Retained existing profiles policies from earlier migration
-- 9. log_audit_action RPC is defined in 003_rpc_functions.sql
--
-- CRITICAL SECURITY NOTES:
-- - Profile INSERT is NOT allowed for normal users - only the auth trigger creates profiles
-- - Role escalation is blocked for both INSERT and UPDATE
-- - All helper functions use SECURITY DEFINER with safe search_path
-- - No anon grants on security functions
-- - RLS is enforced on all protected tables
-- - Audit logging captures actor from auth.uid(), never from client
-- ==============================================================================
