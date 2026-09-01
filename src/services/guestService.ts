// ==============================================================================
// TAHAB HOTEL & SUITES LTD — GUEST DIRECTORY SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type { Profile, Booking } from '../types';
import { toSafeError } from '../types';

export interface GuestWithStats extends Profile {
  totalBookings: number;
  totalSpent: number;
  lastStay?: string;
  recentBookings?: Booking[];
}

/**
 * Fetch guests directory for admin/staff view.
 */
export async function getGuests(): Promise<GuestWithStats[]> {
  const sb = assertSupabaseConfigured();

  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('*')
    .eq('role', 'guest')
    .order('created_at', { ascending: false });

  if (profilesError) throw new Error(toSafeError(profilesError));

  const { data: bookings, error: bookingsError } = await sb
    .from('bookings')
    .select('id, user_id, guest_email, check_in, check_out, total_price, status, created_at');

  if (bookingsError) throw new Error(toSafeError(bookingsError));

  // Compute stats per guest
  return (profiles ?? []).map((profile) => {
    const guestBookings = (bookings ?? []).filter(
      (b: any) => b.user_id === profile.user_id || b.guest_email.toLowerCase() === profile.email.toLowerCase()
    );

    const totalSpent = guestBookings
      .filter((b: any) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
      .reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);

    const sortedByStay = [...guestBookings].sort(
      (a: any, b: any) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
    );

    return {
      ...profile,
      totalBookings: guestBookings.length,
      totalSpent,
      lastStay: sortedByStay[0]?.check_in,
    };
  });
}

/**
 * Update authenticated user's own profile.
 */
export async function updateMyProfile(
  userId: string,
  updates: { fullName: string; phone?: string; avatarUrl?: string }
): Promise<Profile> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('profiles')
    .update({
      full_name: updates.fullName,
      phone: updates.phone || null,
      avatar_url: updates.avatarUrl || null,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(toSafeError(error));
  return data as Profile;
}
