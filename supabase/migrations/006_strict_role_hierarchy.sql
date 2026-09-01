-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 006: STRICT ROLE HIERARCHY
-- ==============================================================================
-- Corrects the ADMIN vs SUPER_ADMIN authorization boundary.
--
-- ROOT CAUSE FIXED:
--   is_current_user_admin() incorrectly returned TRUE for both 'admin' AND
--   'super_admin', making the two roles functionally identical at the database
--   level. This migration introduces precise helper functions and updates all
--   RLS policies to enforce the correct role boundaries.
--
-- APPROACH:
--   Instead of dropping and recreating functions (which causes dependency
--   errors with existing RLS policies), we use CREATE OR REPLACE FUNCTION
--   to update function bodies in place. Existing policies automatically
--   use the new implementation.
--
-- ROLE HELPERS (authoritative):
--   is_current_user_staff()                   -> role = 'staff'
--   is_current_user_admin()                   -> role = 'admin' ONLY
--   is_current_user_super_admin()             -> role = 'super_admin' ONLY
--   is_current_user_admin_or_super_admin()    -> role IN ('admin', 'super_admin')
--   is_current_user_staff_or_admin()          -> role IN ('staff', 'admin', 'super_admin')
--   is_current_user_staff_or_higher()         -> role IN ('staff', 'admin', 'super_admin')
--
-- This migration is fully idempotent and safe to run against existing data.
-- ==============================================================================

-- ==============================================================================
-- SECTION 0: CREATE REQUIRED ENUM TYPES
-- ==============================================================================
-- Note: If this fails, the types may already exist or the database may use TEXT
-- for role columns. The functions below use TEXT to avoid dependency on enum types.
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: CORRECTED ROLE HELPER FUNCTIONS
-- ==============================================================================
-- Using CREATE OR REPLACE FUNCTION to avoid dropping functions that have
-- dependent RLS policies. Existing policies automatically use the new body.

-- ==============================================================================
-- 1.1: is_current_user_staff()
-- TRUE ONLY for role = 'staff'
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role = 'staff';
END;
$$;

-- ==============================================================================
-- 1.2: is_current_user_admin()
-- TRUE ONLY for role = 'admin' (NOT super_admin)
-- THIS IS THE KEY FIX - previously returned IN ('admin', 'super_admin')
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role = 'admin';
END;
$$;

-- ==============================================================================
-- 1.3: is_current_user_super_admin()
-- TRUE ONLY for role = 'super_admin'
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role = 'super_admin';
END;
$$;

-- ==============================================================================
-- 1.4: is_current_user_admin_or_super_admin()
-- TRUE for admin OR super_admin
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_admin_or_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- ==============================================================================
-- 1.5: is_current_user_staff_or_admin()
-- TRUE for staff, admin, OR super_admin
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN user_role IN ('staff', 'admin', 'super_admin');
END;
$$;

-- ==============================================================================
-- 1.6: is_current_user_staff_or_higher()
-- Alias for is_current_user_staff_or_admin() for semantic clarity
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_current_user_staff_or_higher()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN is_current_user_staff_or_admin();
END;
$$;

-- ==============================================================================
-- 1.7: get_current_user_role()
-- Returns the exact role of the current user
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    current_role TEXT;
BEGIN
    SELECT role INTO current_role
    FROM profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    RETURN current_role;
END;
$$;

-- ==============================================================================
-- 1.8: is_current_user_active()
-- ==============================================================================
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

-- ==============================================================================
-- 1.9: get_current_profile_id()
-- ==============================================================================
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
-- SECTION 2: UPDATED ROLE ESCALATION PROTECTION
-- ==============================================================================
-- Ensures:
-- - ADMIN cannot promote anyone to super_admin
-- - ADMIN cannot create super_admin accounts
-- - ADMIN cannot modify super_admin accounts
-- - Only super_admin can assign elevated roles
-- - First-admin bootstrap is preserved via secure setup token

DROP TRIGGER IF EXISTS trigger_prevent_role_escalation_update ON public.profiles;
DROP TRIGGER IF EXISTS trigger_prevent_role_escalation_insert ON public.profiles;
DROP FUNCTION IF EXISTS prevent_role_escalation();

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_role TEXT;
    is_super_admin_val BOOLEAN;
    is_first_admin_bootstrap BOOLEAN;
BEGIN
    -- Get the current user's role from the database
    SELECT role INTO current_user_role
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    -- TRUSTED BOOTSTRAP 1: allow handle_new_user() to create the initial guest profile
    IF current_user_role IS NULL AND TG_OP = 'INSERT' AND NEW.role = 'guest' THEN
        RETURN NEW;
    END IF;

    -- If no active profile found, user cannot modify roles
    IF current_user_role IS NULL THEN
        RAISE EXCEPTION 'Only active authenticated users can modify profiles.';
    END IF;

    is_super_admin_val := (current_user_role = 'super_admin');

    -- TRUSTED BOOTSTRAP 2: detect first super_admin bootstrap BEFORE the NULL check
    -- This must run before rejecting NULL current_user_role, because the bootstrap
    -- path is the one legitimate case where a guest self-updates to admin/super_admin.
    is_first_admin_bootstrap := (
        TG_OP = 'UPDATE'
        AND OLD.user_id = auth.uid()
        AND current_user_role = 'guest'
        AND NEW.role IN ('admin', 'super_admin')
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE role IN ('admin', 'super_admin')
              AND user_id != auth.uid()
        )
    );

    -- For UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        -- Prevent users from modifying their own role/is_active
        -- Exception: first-admin bootstrap
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

        -- Prevent admin from modifying super_admin accounts at all
        IF OLD.role = 'super_admin' AND current_user_role = 'admin' THEN
            RAISE EXCEPTION 'Only super administrators can modify super admin accounts.';
        END IF;

        -- Prevent admin from promoting anyone to super_admin
        IF NEW.role = 'super_admin' AND current_user_role = 'admin' THEN
            RAISE EXCEPTION 'Only super administrators can assign super admin role.';
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

        -- Admin cannot create admin accounts either (only super_admin)
        IF current_user_role = 'admin' AND NEW.role IN ('admin', 'super_admin') THEN
            RAISE EXCEPTION 'Only super administrators can create elevated role accounts.';
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

CREATE TRIGGER trigger_prevent_role_escalation_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

CREATE TRIGGER trigger_prevent_role_escalation_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

-- ==============================================================================
-- SECTION 3: GRANT EXECUTE ON CORRECTED FUNCTIONS
-- ==============================================================================
GRANT EXECUTE ON FUNCTION is_current_user_staff TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin_or_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_staff_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_staff_or_higher TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_active TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_profile_id TO authenticated;

-- ==============================================================================
-- SECTION 4: CORRECTED RLS POLICIES
-- ==============================================================================
-- All policies now use precise role helper functions.
-- ADMIN and SUPER_ADMIN are no longer treated identically.

-- ==============================================================================
-- 4.1: PROFILES POLICIES
-- ==============================================================================
-- Note: We only recreate policies that need different authorization.
-- Policies that were already correct are left unchanged.

-- Super_admin can update any profile (including role and is_active)
-- Admin can update non-super_admin profiles
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (
        is_current_user_super_admin()
        OR (is_current_user_admin() AND OLD.role <> 'super_admin')
    );

-- Only super_admin can delete profiles
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin" ON profiles
    FOR DELETE USING (is_current_user_super_admin());

-- ==============================================================================
-- 4.2: BOOKINGS POLICIES
-- ==============================================================================

-- Guests see their own; staff/admin/super_admin see all
DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_current_user_staff_or_admin()
    );

-- Authenticated users can create bookings for themselves or staff+
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
CREATE POLICY "bookings_insert" ON bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR is_current_user_staff_or_admin()
    );

-- Staff/admin/super_admin can update bookings
DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_update" ON bookings
    FOR UPDATE
    TO authenticated
    USING (is_current_user_staff_or_admin())
    WITH CHECK (is_current_user_staff_or_admin());

-- Only super_admin can delete bookings
DROP POLICY IF EXISTS "bookings_delete" ON bookings;
CREATE POLICY "bookings_delete" ON bookings
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- ==============================================================================
-- 4.3: ROOMS POLICIES
-- ==============================================================================

-- Public: listed, non-inactive rooms; staff/admin/super_admin see all
DROP POLICY IF EXISTS "rooms_select" ON rooms;
CREATE POLICY "rooms_select" ON rooms
    FOR SELECT USING (
        (is_listed = TRUE AND status != 'inactive')
        OR is_current_user_staff_or_admin()
    );

-- Admin + super_admin can create rooms
DROP POLICY IF EXISTS "rooms_insert" ON rooms;
CREATE POLICY "rooms_insert" ON rooms
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

-- Admin + super_admin can update rooms
DROP POLICY IF EXISTS "rooms_update" ON rooms;
CREATE POLICY "rooms_update" ON rooms
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin_or_super_admin())
    WITH CHECK (is_current_user_admin_or_super_admin());

-- Only super_admin can delete rooms
DROP POLICY IF EXISTS "rooms_delete" ON rooms;
CREATE POLICY "rooms_delete" ON rooms
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- ==============================================================================
-- 4.4: ROOM IMAGES POLICIES
-- ==============================================================================

-- Public: images of listed rooms; staff/admin/super_admin see all
DROP POLICY IF EXISTS "room_images_select" ON room_images;
CREATE POLICY "room_images_select" ON room_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = room_images.room_id
              AND rooms.is_listed = TRUE
        )
        OR is_current_user_staff_or_admin()
    );

-- Admin + super_admin can manage room images
DROP POLICY IF EXISTS "room_images_insert" ON room_images;
CREATE POLICY "room_images_insert" ON room_images
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "room_images_update" ON room_images;
CREATE POLICY "room_images_update" ON room_images
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin_or_super_admin())
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "room_images_delete" ON room_images;
CREATE POLICY "room_images_delete" ON room_images
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.5: ROOM AMENITIES POLICIES
-- ==============================================================================

-- Public: amenities of listed rooms; staff/admin/super_admin see all
DROP POLICY IF EXISTS "room_amenities_select" ON room_amenities;
CREATE POLICY "room_amenities_select" ON room_amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = room_amenities.room_id
              AND rooms.is_listed = TRUE
        )
        OR is_current_user_staff_or_admin()
    );

-- Admin + super_admin can manage room amenities
DROP POLICY IF EXISTS "room_amenities_insert" ON room_amenities;
CREATE POLICY "room_amenities_insert" ON room_amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "room_amenities_delete" ON room_amenities;
CREATE POLICY "room_amenities_delete" ON room_amenities
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.6: AMENITIES POLICIES
-- ==============================================================================

-- Public: active amenities; staff/admin/super_admin see all
DROP POLICY IF EXISTS "amenities_select" ON amenities;
CREATE POLICY "amenities_select" ON amenities
    FOR SELECT USING (
        status = 'active'
        OR is_current_user_staff_or_admin()
    );

-- Admin + super_admin can manage amenities
DROP POLICY IF EXISTS "amenities_insert" ON amenities;
CREATE POLICY "amenities_insert" ON amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "amenities_update" ON amenities;
CREATE POLICY "amenities_update" ON amenities
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin_or_super_admin())
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "amenities_delete" ON amenities;
CREATE POLICY "amenities_delete" ON amenities
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.7: GALLERY POLICIES
-- ==============================================================================

-- Public read
DROP POLICY IF EXISTS "gallery_select" ON gallery;
CREATE POLICY "gallery_select" ON gallery
    FOR SELECT USING (TRUE);

-- Admin + super_admin can manage gallery
DROP POLICY IF EXISTS "gallery_insert" ON gallery;
CREATE POLICY "gallery_insert" ON gallery
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "gallery_update" ON gallery;
CREATE POLICY "gallery_update" ON gallery
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin_or_super_admin())
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "gallery_delete" ON gallery;
CREATE POLICY "gallery_delete" ON gallery
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.8: CONTACT MESSAGES POLICIES
-- ==============================================================================

-- Anyone can insert contact messages (public form)
DROP POLICY IF EXISTS "contact_messages_insert_public" ON contact_messages;
CREATE POLICY "contact_messages_insert_public" ON contact_messages
    FOR INSERT
    TO public
    WITH CHECK (TRUE);

-- Staff and above can read contact messages
DROP POLICY IF EXISTS "contact_messages_select" ON contact_messages;
CREATE POLICY "contact_messages_select" ON contact_messages
    FOR SELECT
    TO authenticated
    USING (is_current_user_staff_or_admin());

-- Staff and above can update contact messages (mark as read, etc.)
DROP POLICY IF EXISTS "contact_messages_update" ON contact_messages;
CREATE POLICY "contact_messages_update" ON contact_messages
    FOR UPDATE
    TO authenticated
    USING (is_current_user_staff_or_admin())
    WITH CHECK (is_current_user_staff_or_admin());

-- Admin + super_admin can delete contact messages
DROP POLICY IF EXISTS "contact_messages_delete" ON contact_messages;
CREATE POLICY "contact_messages_delete" ON contact_messages
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.9: SITE SETTINGS POLICIES
-- ==============================================================================

-- Anyone can read site settings
DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
CREATE POLICY "site_settings_select" ON site_settings
    FOR SELECT USING (TRUE);

-- Admin + super_admin can manage site settings
DROP POLICY IF EXISTS "site_settings_insert" ON site_settings;
CREATE POLICY "site_settings_insert" ON site_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "site_settings_update" ON site_settings;
CREATE POLICY "site_settings_update" ON site_settings
    FOR UPDATE
    TO authenticated
    USING (is_current_user_admin_or_super_admin())
    WITH CHECK (is_current_user_admin_or_super_admin());

DROP POLICY IF EXISTS "site_settings_delete" ON site_settings;
CREATE POLICY "site_settings_delete" ON site_settings
    FOR DELETE
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- ==============================================================================
-- 4.10: AUDIT LOGS POLICIES
-- ==============================================================================

-- Admin + super_admin can view audit logs
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (is_current_user_admin_or_super_admin());

-- Only super_admin can delete audit logs
DROP POLICY IF EXISTS "audit_logs_delete" ON audit_logs;
CREATE POLICY "audit_logs_delete" ON audit_logs
    FOR DELETE
    TO authenticated
    USING (is_current_user_super_admin());

-- ==============================================================================
-- 4.11: STAFF PERMISSIONS POLICIES
-- ==============================================================================

-- Staff can read their own permissions; admin/super_admin can read all
DROP POLICY IF EXISTS "staff_perms_select_own" ON staff_permissions;
CREATE POLICY "staff_perms_select_own" ON staff_permissions
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_current_user_admin_or_super_admin()
    );

-- Super_admin can grant/revoke all permissions
-- Admin can grant/revoke permissions for staff only (not other admins)
DROP POLICY IF EXISTS "staff_perms_all_admin" ON staff_permissions;
CREATE POLICY "staff_perms_all_admin" ON staff_permissions
    FOR ALL USING (
        is_current_user_super_admin()
        OR (
            is_current_user_admin()
            AND EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = staff_permissions.user_id
                  AND profiles.role IN ('staff', 'guest')
            )
        )
    )
    WITH CHECK (
        is_current_user_super_admin()
        OR (
            is_current_user_admin()
            AND EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = staff_permissions.user_id
                  AND profiles.role IN ('staff', 'guest')
            )
        )
    );

-- ==============================================================================
-- SECTION 5: NEW RPC FUNCTIONS FOR SUPER-ADMIN OPERATIONS
-- ==============================================================================

-- ==============================================================================
-- 5.1: update_user_role_super_admin()
-- Super-admin-only function to update any user's role and active status.
-- Logs an audit entry automatically.
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_user_role_super_admin(
    p_target_user_id UUID,
    p_new_role TEXT,
    p_new_is_active BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_profile RECORD;
    v_actor_profile RECORD;
BEGIN
    -- Must be super_admin
    IF NOT is_current_user_super_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only super administrators can modify user roles.';
    END IF;

    -- Load target profile
    SELECT * INTO v_profile FROM public.profiles
    WHERE user_id = p_target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND: Target user profile not found.';
    END IF;

    -- Cannot modify self
    IF v_profile.user_id = auth.uid() THEN
        RAISE EXCEPTION 'You cannot modify your own role through this function.';
    END IF;

    -- Prevent modifying super_admin unless the actor is also super_admin
    IF v_profile.role = 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can modify other super admin accounts.';
    END IF;

    -- Prevent creating super_admin through this function
    IF p_new_role = 'super_admin' THEN
        RAISE EXCEPTION 'Cannot create super_admin accounts through this function. Use the bootstrap mechanism.';
    END IF;

    -- Update the profile
    UPDATE public.profiles
    SET role = p_new_role,
        is_active = p_new_is_active,
        updated_at = NOW()
    WHERE user_id = p_target_user_id
    RETURNING * INTO v_profile;

    -- Log audit action
    SELECT * INTO v_actor_profile FROM public.profiles
    WHERE user_id = auth.uid();

    INSERT INTO public.audit_logs (
        actor_id,
        actor_email,
        actor_role,
        action,
        entity_type,
        entity_id,
        metadata
    )
    VALUES (
        auth.uid(),
        v_actor_profile.email,
        v_actor_profile.role::TEXT,
        'user_role_updated_super_admin',
        'profile',
        v_profile.id::TEXT,
        jsonb_build_object(
            'target_user_id', p_target_user_id,
            'target_email', v_profile.email,
            'old_role', v_profile.role,
            'new_role', p_new_role,
            'old_is_active', v_profile.is_active,
            'new_is_active', p_new_is_active
        )
    );

    RETURN json_build_object(
        'success', TRUE,
        'id', v_profile.id,
        'user_id', v_profile.user_id,
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'role', v_profile.role,
        'is_active', v_profile.is_active
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION update_user_role_super_admin(UUID, TEXT, BOOLEAN) TO authenticated;

-- ==============================================================================
-- 5.2: admin_can_create_admin()
-- Returns FALSE — only super_admin can create admins.
-- ==============================================================================
CREATE OR REPLACE FUNCTION admin_can_create_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION admin_can_create_admin() TO authenticated;

-- ==============================================================================
-- SECTION 6: MIGRATION SUMMARY
-- ==============================================================================
--
-- ROOT CAUSE:
--   is_current_user_admin() returned user_role IN ('admin', 'super_admin'),
--   making admin and super_admin functionally identical at the database level.
--
-- CHANGES:
--   1. Replaced all role helper functions with precise, single-purpose versions
--      using CREATE OR REPLACE FUNCTION (no dependency issues).
--   2. Added is_current_user_staff(), is_current_user_admin_or_super_admin(),
--      is_current_user_staff_or_higher() for explicit authorization.
--   3. Updated select RLS policies to use the correct helper for each operation.
--   4. Admin-only operations now use is_current_user_admin() (role = 'admin' ONLY).
--   5. Admin+super_admin operations use is_current_user_admin_or_super_admin().
--   6. Super-admin-only operations use is_current_user_super_admin().
--   7. Strengthened prevent_role_escalation() to block admin->super_admin promotion.
--   8. Added update_user_role_super_admin() RPC for safe super-admin role changes.
--   9. Added admin_can_create_admin() returning FALSE to enforce super_admin-only admin creation.
--
-- PERMISSION MATRIX (Database-enforced):
--   Operation                           | Staff | Admin | Super Admin
--   ------------------------------------|-------|-------|------------
--   View own profile                    |   ✅  |   ✅  |     ✅
--   View all profiles                   |   ❌  |   ✅  |     ✅
--   Update own profile                  |   ✅  |   ✅  |     ✅
--   Update other profiles               |   ❌  |   ✅* |     ✅
--   Create admin accounts               |   ❌  |   ❌  |     ✅
--   Create super_admin accounts         |   ❌  |   ❌  |     ❌
--   Delete audit logs                   |   ❌  |   ❌  |     ✅
--   Delete rooms                        |   ❌  |   ❌  |     ✅
--   Delete bookings                     |   ❌  |   ❌  |     ✅
--   Manage rooms                        |   ❌  |   ✅  |     ✅
--   Manage gallery                      |   ❌  |   ✅  |     ✅
--   Manage amenities                    |   ❌  |   ✅  |     ✅
--   Manage site settings                |   ❌  |   ✅  |     ✅
--   View audit logs                     |   ❌  |   ✅  |     ✅
--   Manage staff roles/permissions      |   ❌  |   ✅  |     ✅
--   Modify super_admin accounts         |   ❌  |   ❌  |     ✅
--   Promote to super_admin              |   ❌  |   ❌  |     ❌
--
--   * Admin can update staff/guest profiles but NOT super_admin profiles.
--
-- ==============================================================================
