-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 003: FIX PROFILE CREATION AND SECURITY HARDENING
-- ==============================================================================
-- This migration fixes the bootstrap deadlock between handle_new_user() and
-- prevent_role_escalation(), and hardens SECURITY DEFINER functions.
-- ==============================================================================

-- Ensure required enum types exist before creating functions that reference them.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest', 'staff', 'admin', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
        CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_category') THEN
        CREATE TYPE room_category AS ENUM ('standard', 'executive', 'presidential');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'amenity_category') THEN
        CREATE TYPE amenity_category AS ENUM ('dining', 'wellness', 'business', 'entertainment', 'general');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived', 'replied');
    END IF;
END $$;

-- Ensure setup_tokens exists even if 002_production_hardening.sql was not applied.
CREATE TABLE IF NOT EXISTS setup_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash  TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used_at     TIMESTAMPTZ,
    used_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ==============================================================================
-- SECTION 1: FIX prevent_role_escalation()
-- ==============================================================================
-- The previous version blocked ALL INSERTs when no active profile existed,
-- including the trusted handle_new_user() trigger that creates the initial
-- guest profile. This made normal registration impossible.
--
-- This version:
-- - Allows trusted initial guest profile creation from handle_new_user()
-- - Allows first-time super_admin bootstrap via provision_first_admin()
-- - Still blocks arbitrary self INSERTs/UPDATEs and role escalation

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
    -- This fires BEFORE INSERT on profiles with role='guest' when no active profile exists yet.
    IF current_user_role IS NULL AND TG_OP = 'INSERT' AND NEW.role = 'guest' THEN
        RETURN NEW;
    END IF;

    -- If no active profile found, user cannot modify roles
    IF current_user_role IS NULL THEN
        RAISE EXCEPTION 'Only active authenticated users can modify profiles.';
    END IF;

    is_super_admin_val := (current_user_role = 'super_admin');

    -- TRUSTED BOOTSTRAP 2: allow first super_admin bootstrap via provision_first_admin()
    -- This is the ONLY allowed self-role-change from guest -> admin/super_admin.
    -- It requires:
    --   - Updating own profile
    --   - Currently guest
    --   - Target role is admin or super_admin
    --   - No other admin/super_admin exists in the system (first bootstrap)
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

-- Re-create the triggers to use the fixed function
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
    -- TRUSTED BOOTSTRAP 1: allow handle_new_user() to create the initial guest profile
    -- This fires BEFORE INSERT on profiles with role='guest' when no active profile exists yet.
    IF TG_OP = 'INSERT' AND NEW.role = 'guest' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id
        ) THEN
            RETURN NEW;
        END IF;
    END IF;

    -- TRUSTED BOOTSTRAP 2: detect first super_admin bootstrap BEFORE the NULL check
    -- This must run before rejecting NULL current_user_role, because the bootstrap
    -- path is the one legitimate case where a guest self-updates to admin/super_admin.
    is_first_admin_bootstrap := (
        TG_OP = 'UPDATE'
        AND OLD.role = 'guest'
        AND NEW.role IN ('admin', 'super_admin')
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE role IN ('admin', 'super_admin')
              AND user_id != OLD.user_id
        )
    );

    -- Get the current user's role from the database
    SELECT role INTO current_user_role
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE;

    -- If no active profile found, user cannot modify roles
    IF current_user_role IS NULL THEN
        IF NOT is_first_admin_bootstrap THEN
            RAISE EXCEPTION 'Only active authenticated users can modify profiles.';
        END IF;
    END IF;

    is_super_admin_val := (current_user_role = 'super_admin');

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

CREATE TRIGGER trigger_prevent_role_escalation_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

CREATE TRIGGER trigger_prevent_role_escalation_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

-- ==============================================================================
-- SECTION 2: ENSURE profiles.user_id IS UNIQUE
-- ==============================================================================
-- Prevents PostgREST 406 errors from duplicate profile rows.
-- Idempotent: safe to run multiple times.

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique
    ON public.profiles(user_id)
    WHERE user_id IS NOT NULL;

-- ==============================================================================
-- SECTION 2B: AUDIT LOGS COMPATIBILITY
-- ==============================================================================
-- RPC functions treat entity_id as TEXT. Make the column type match so
-- create_booking_safe / transition_booking_status / log_audit_action
-- do not fail with a type-mismatch 400 from PostgREST.

ALTER TABLE audit_logs
    ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;

-- ==============================================================================
-- SECTION 3: REPAIR EXISTING AUTH USERS WITHOUT PROFILES
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

GRANT EXECUTE ON FUNCTION repair_missing_profiles() TO authenticated;

COMMENT ON FUNCTION repair_missing_profiles() IS
  'One-time repair for auth users missing profiles. Run in Supabase SQL editor if needed.';

-- ==============================================================================
-- SECTION 4: VERIFICATION QUERIES
-- ==============================================================================
-- Run these after applying the migration to verify the fix:

-- 1. Check that the trigger function was updated
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'prevent_role_escalation';

-- 2. Check that the unique index exists
-- SELECT indexname FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_user_id_unique';

-- 3. Repair any existing auth users without profiles
-- SELECT repair_missing_profiles();

-- 4. Verify the specific user now has a profile
-- SELECT id, user_id, email, role, is_active FROM public.profiles WHERE user_id = '52146448-64ae-4253-8701-2c02ba71f849';

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Summary:
-- 1. Fixed prevent_role_escalation() to allow trusted initial guest profile creation
-- 2. Fixed prevent_role_escalation() to allow first super_admin bootstrap
-- 3. Added unique index on profiles.user_id to prevent 406 errors
-- 4. Added repair_missing_profiles() to fix existing auth users without profiles
-- 5. Hardened prevent_role_escalation() with SET search_path = ''
-- 6. Explicitly qualified all table references with public schema
-- ==============================================================================
