// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SUPABASE CLIENT
//
// The supabase client is initialized from environment variables.
// If env vars are not set (local dev without Supabase), isSupabaseConfigured
// will be false and supabase will be null.
//
// NEVER expose SUPABASE_SERVICE_ROLE_KEY in this file.
// Service role operations are handled via Edge Functions only.
// ==============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'tahab_auth_v2',
      },
    })
  : null;

/**
 * Assert that Supabase is configured and return the client.
 * Throws a user-safe error if not configured (i.e. env vars missing).
 */
export function assertSupabaseConfigured(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'SUPABASE_NOT_CONFIGURED: The application is not connected to a backend. ' +
      'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}
