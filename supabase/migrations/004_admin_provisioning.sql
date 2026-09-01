-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 004: SECURE FIRST-ADMIN PROVISIONING
--
-- This creates a one-time setup mechanism for the first administrator.
-- Run this migration BEFORE anyone registers.
--
-- PROCESS:
-- 1. Run this migration in the Supabase SQL editor.
-- 2. Generate a setup token using the generate_setup_token() function:
--    SELECT generate_setup_token('YOUR_SECRET_PASSPHRASE');
--    Copy the returned token value.
-- 3. Set VITE_SETUP_SECRET=<that token> in your environment.
-- 4. Visit /setup in your browser while logged in as the intended admin.
-- 5. Remove VITE_SETUP_SECRET from your environment after use.
--
-- SECURITY NOTES:
-- - The token is stored as a hash — the plaintext is never stored.
-- - The token expires after 24 hours automatically.
-- - Only one admin can be provisioned through this mechanism.
-- - After provisioning, manage all future admins through /admin/staff.
-- ==============================================================================

-- Ensure setup_tokens exists even if 002_production_hardening.sql was not applied.
CREATE TABLE IF NOT EXISTS public.setup_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash  TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used_at     TIMESTAMPTZ,
    used_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Generate a setup token (run once in Supabase SQL editor during deployment)
CREATE OR REPLACE FUNCTION public.generate_setup_token(p_passphrase TEXT)
RETURNS TEXT AS $$
DECLARE
    v_token      TEXT;
    v_token_hash TEXT;
BEGIN
    v_token := md5(now()::text || random()::text || random()::text);
    v_token_hash := md5(v_token || p_passphrase);

    BEGIN
        DELETE FROM public.setup_tokens WHERE used_at IS NULL;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;

    INSERT INTO public.setup_tokens (token_hash)
    VALUES (v_token_hash);

    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Provision the first admin using a valid setup token
CREATE OR REPLACE FUNCTION public.provision_first_admin(
    p_token       TEXT,
    p_passphrase  TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
    v_token_row   RECORD;
    v_user_id     UUID;
    v_profile     RECORD;
    v_admin_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: You must be logged in to provision admin access';
    END IF;

    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles
    WHERE role IN ('admin', 'super_admin');

    IF v_admin_count > 0 THEN
        RAISE EXCEPTION 'ALREADY_PROVISIONED: An administrator already exists. Use /admin/staff to manage staff.';
    END IF;

    SELECT * INTO v_token_row
    FROM public.setup_tokens
    WHERE used_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVALID_TOKEN: No valid setup token found. Generate a new one from the Supabase SQL editor.';
    END IF;

    IF md5(p_token || p_passphrase) != v_token_row.token_hash THEN
        RAISE EXCEPTION 'INVALID_TOKEN: The setup token is incorrect.';
    END IF;

    UPDATE public.setup_tokens
    SET used_at = NOW(), used_by = v_user_id
    WHERE id = v_token_row.id;

    UPDATE public.profiles
    SET role = 'admin', is_active = TRUE, updated_at = NOW()
    WHERE user_id = v_user_id
    RETURNING * INTO v_profile;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND: User profile not found. Please ensure your account registration is complete.';
    END IF;

    INSERT INTO public.audit_logs (
        actor_id, action, entity_type, entity_id, metadata
    )
    VALUES (
        v_user_id,
        'first_admin_provisioned',
        'profile',
        v_profile.id::TEXT,
        jsonb_build_object('email', v_profile.email, 'full_name', v_profile.full_name)
    );

    RETURN json_build_object(
        'success', TRUE,
        'message', 'Administrator access granted successfully. You can now access the admin dashboard.',
        'email', v_profile.email,
        'full_name', v_profile.full_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION generate_setup_token(TEXT) IS
    'Run once in Supabase SQL editor during deployment to generate the first-admin setup token.';

COMMENT ON FUNCTION provision_first_admin(TEXT, TEXT) IS
    'Called from the /setup frontend page to elevate the first authenticated user to admin.';
