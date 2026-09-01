// ==============================================================================
// TAHAB HOTEL & SUITES LTD — NOTIFICATION SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type { Notification } from '../types';
import { toSafeError } from '../types';

export async function getMyNotifications(): Promise<Notification[]> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(toSafeError(error));
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const sb = assertSupabaseConfigured();

  const { error } = await sb
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw new Error(toSafeError(error));
}
