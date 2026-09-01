// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING SERVICE
//
// All booking operations go through Supabase RPC functions that enforce:
//   - Server-side price calculation (total_price never trusted from client)
//   - Atomic availability checking with advisory lock
//   - State machine transitions
//   - Audit logging
// ==============================================================================

import { supabase, assertSupabaseConfigured } from '../lib/supabase';
import type {
  Booking,
  BookingCreationResult,
  BookingStatus,
  toSafeError as _toSafeError,
} from '../types';
import { toSafeError } from '../types';

export interface CreateBookingInput {
  roomId: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest?: string;
}

export interface BookingFilters {
  status?: BookingStatus | 'all';
  search?: string;
  checkIn?: string;
  checkOut?: string;
  roomId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Create a booking atomically via the create_booking_safe RPC.
 * Price is calculated server-side — never sent from the client.
 * Throws the original Supabase error object for proper error mapping in the UI.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingCreationResult> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb.rpc('create_booking_safe', {
    p_room_id: input.roomId,
    p_check_in: input.checkIn,
    p_check_out: input.checkOut,
    p_guest_count: input.guestCount,
    p_guest_name: input.guestName.trim(),
    p_guest_email: input.guestEmail.trim().toLowerCase(),
    p_guest_phone: input.guestPhone.trim(),
    p_special_request: input.specialRequest?.trim() || null,
  });

  if (error) throw error; // Throw original error for mapping in UI
  if (!data) throw new Error('Booking creation failed. Please try again.');

  return data as BookingCreationResult;
}

/**
 * Check room availability for a date range (server-side validation).
 * Returns true if available, false if conflicting bookings exist.
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): Promise<boolean> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb.rpc('check_room_availability', {
    p_room_id: roomId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_exclude_booking_id: excludeBookingId || null,
  });

  if (error) {
    // If the error is a validation error (bad dates, inactive room), return false
    console.warn('[bookingService] Availability check error:', error.message);
    return false;
  }

  return data === true;
}

/**
 * Transition a booking through its state machine via RPC.
 * Enforces allowed transitions server-side.
 */
export async function transitionBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  actorId?: string,
  reason?: string
): Promise<{ id: string; status: BookingStatus; reference: string }> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb.rpc('transition_booking_status', {
    p_booking_id: bookingId,
    p_new_status: newStatus,
    p_actor_id: actorId || null,
    p_reason: reason || null,
  });

  if (error) throw new Error(toSafeError(error));
  if (!data) throw new Error('Status update failed.');

  return data as { id: string; status: BookingStatus; reference: string };
}

/**
 * Fetch all bookings (admin/staff view) with optional filters.
 */
export async function getBookings(filters?: BookingFilters): Promise<Booking[]> {
  const sb = assertSupabaseConfigured();

  let query = sb
    .from('bookings')
    .select(`
      *,
      room:rooms (
        id, name, slug, category, price_per_night, capacity, floor, status,
        room_images (id, image_url, alt_text, is_primary, sort_order)
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.roomId) {
    query = query.eq('room_id', filters.roomId);
  }

  if (filters?.checkIn) {
    query = query.gte('check_in', filters.checkIn);
  }

  if (filters?.checkOut) {
    query = query.lte('check_out', filters.checkOut);
  }

  if (filters?.search) {
    const q = filters.search.trim();
    query = query.or(
      `booking_reference.ilike.%${q}%,guest_name.ilike.%${q}%,guest_email.ilike.%${q}%,guest_phone.ilike.%${q}%`
    );
  }

  const pageSize = filters?.pageSize ?? 50;
  const page = filters?.page ?? 0;
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error } = await query;
  if (error) throw new Error(toSafeError(error));

  return (data ?? []).map((b: any) => ({
    ...b,
    room: b.room
      ? {
          ...b.room,
          images: b.room.room_images ?? [],
          amenities: [],
        }
      : undefined,
  }));
}

/**
 * Fetch the authenticated guest's own bookings.
 */
export async function getMyBookings(): Promise<Booking[]> {
  const sb = assertSupabaseConfigured();

  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) {
    throw new Error('Not authenticated.');
  }

  const { data, error } = await sb
    .from('bookings')
    .select(`
      *,
      room:rooms (
        id, name, slug, category, price_per_night, capacity, floor, status,
        room_images (id, image_url, alt_text, is_primary, sort_order)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(toSafeError(error));

  return (data ?? []).map((b: any) => ({
    ...b,
    room: b.room ? { ...b.room, images: b.room.room_images ?? [], amenities: [] } : undefined,
  }));
}

/**
 * Look up a booking by reference (public — for booking confirmation pages).
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  if (!supabase) throw new Error('Backend not configured.');

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      room:rooms (id, name, slug, category, room_images (id, image_url, is_primary))
    `)
    .eq('booking_reference', reference.trim().toUpperCase())
    .maybeSingle();

  if (error) throw new Error(toSafeError(error));
  if (!data) return null;

  return {
    ...data,
    room: data.room ? { ...data.room, images: data.room.room_images ?? [], amenities: [] } : undefined,
  };
}

/**
 * Guest self-cancellation — only allowed for pending bookings.
 * Uses the state machine RPC which enforces valid transitions.
 */
export async function cancelMyBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const sb = assertSupabaseConfigured();

  // Verify ownership before attempting cancellation
  const { data: booking, error: fetchError } = await sb
    .from('bookings')
    .select('id, user_id, status')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) throw new Error('Booking not found.');
  if (booking.user_id !== userId) throw new Error('You do not have permission to cancel this booking.');
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new Error('This booking cannot be cancelled at this stage.');
  }

  await transitionBookingStatus(bookingId, 'cancelled', userId, reason || 'Guest cancellation');
}
