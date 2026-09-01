// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING ERROR MAPPING
//
// Translates backend RPC errors into user-friendly, actionable messages.
// Never exposes database internals or technical implementation details.
// ==============================================================================

import type { PostgrestError } from '@supabase/supabase-js';

export interface BookingErrorDisplay {
  title: string;
  message: string;
}

/**
 * Maps backend error codes/prefixes to user-friendly error messages.
 * Based on the actual RAISE EXCEPTION statements in create_booking_safe RPC.
 */
const BOOKING_ERROR_MAP: Record<string, BookingErrorDisplay> = {
  ROOM_CONFLICT: {
    title: 'Room Unavailable',
    message: 'This room is already booked for the selected dates. Please choose different dates.',
  },
  ROOM_UNAVAILABLE: {
    title: 'Room Unavailable',
    message: 'The selected room is not currently available for booking. Please choose another room.',
  },
  INVALID_DATES: {
    title: 'Invalid Dates',
    message: 'Please check your check-in and check-out dates. Check-out must be after check-in and dates cannot be in the past.',
  },
  INVALID_GUESTS: {
    title: 'Invalid Guest Count',
    message: 'The guest count exceeds this room\'s capacity. Please reduce the number of guests or select a larger room.',
  },
};

/**
 * Extracts a user-friendly error message from a Supabase/PostgreSQL error.
 * Handles both structured error codes and message prefixes.
 */
export function getBookingErrorMessage(error: unknown): BookingErrorDisplay {
  console.error('[bookingErrors] Raw error:', error);

  // Handle Supabase PostgrestError
  const pgError = error as PostgrestError;
  const message = pgError?.message || String(error || '');

  // Check for known error prefixes in the message
  for (const [prefix, display] of Object.entries(BOOKING_ERROR_MAP)) {
    if (message.includes(`${prefix}:`)) {
      return display;
    }
  }

  // Handle network/connection errors
  if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'We couldn\'t connect to our booking system. Please check your internet connection and try again.',
    };
  }

  // Handle authentication errors
  if (message.includes('JWT') || message.includes('token') || message.includes('auth')) {
    return {
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to complete your booking.',
    };
  }

  // Handle permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('row-level security')) {
    return {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action. Please contact support if you believe this is an error.',
    };
  }

  // Generic fallback for unknown errors
  return {
    title: 'Booking Failed',
    message: 'We couldn\'t complete your booking right now. Please try again. If the problem persists, please contact our front desk.',
  };
}

/**
 * Checks if an error is a room conflict (for inline date field errors)
 */
export function isRoomConflictError(error: unknown): boolean {
  const message = (error as PostgrestError)?.message || String(error || '');
  return message.includes('ROOM_CONFLICT:');
}

/**
 * Checks if an error is date-related (for inline date field errors)
 */
export function isDateError(error: unknown): boolean {
  const message = (error as PostgrestError)?.message || String(error || '');
  return message.includes('INVALID_DATES:');
}
