// ==============================================================================
// TAHAB HOTEL & SUITES LTD — FORMATTING UTILITIES
// ==============================================================================

/**
 * Format price in Nigerian Naira (NGN ₦)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string into readable hotel date (e.g., "Mon, Oct 14, 2026")
 */
export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time string or timestamp
 */
export function formatTime(dateStr: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate total nights between two date strings
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
}

/**
 * Generate a randomized memorable booking reference code (e.g., "THB-92841")
 */
export function generateBookingReference(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `THB-${randomNum}`;
}

/**
 * Human readable status labels & styling config
 */
export function getStatusConfig(status: string) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        bg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
        dot: 'bg-emerald-400',
      };
    case 'pending':
      return {
        label: 'Pending Review',
        bg: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
        dot: 'bg-amber-400 animate-pulse',
      };
    case 'checked_in':
      return {
        label: 'Checked In',
        bg: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
        dot: 'bg-blue-400',
      };
    case 'checked_out':
      return {
        label: 'Checked Out',
        bg: 'bg-stone-800 text-stone-300 border-stone-700',
        dot: 'bg-stone-400',
      };
    case 'cancelled':
    case 'rejected':
      return {
        label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
        bg: 'bg-rose-900/40 text-rose-300 border-rose-700/50',
        dot: 'bg-rose-400',
      };
    case 'available':
      return {
        label: 'Available',
        bg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
        dot: 'bg-emerald-400',
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        bg: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
        dot: 'bg-amber-400',
      };
    case 'booked':
      return {
        label: 'Reserved',
        bg: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
        dot: 'bg-purple-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-stone-800 text-stone-300 border-stone-700',
        dot: 'bg-stone-400',
      };
  }
}
