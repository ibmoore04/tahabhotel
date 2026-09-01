// ==============================================================================
// TAHAB HOTEL & SUITES LTD — REALTIME BOOKINGS & OPERATIONS HOOK
// ==============================================================================

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function useRealtimeOperations(): void {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isStaffOrAdmin } = useAuth();

  useEffect(() => {
    if (!supabase || !isStaffOrAdmin) return;

    const channel = supabase
      .channel('hotel_operations_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
          queryClient.invalidateQueries({ queryKey: ['recentBookings'] });
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
          queryClient.invalidateQueries({ queryKey: ['staffArrivalsToday'] });

          const newBooking = payload.new;
          showToast({
            type: 'info',
            title: 'New Reservation Request!',
            message: `Booking #${newBooking?.booking_reference || ''} received from ${newBooking?.guest_name || 'Guest'}.`,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
          queryClient.invalidateQueries({ queryKey: ['recentBookings'] });
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
          queryClient.invalidateQueries({ queryKey: ['staffArrivalsToday'] });
          queryClient.invalidateQueries({ queryKey: ['staffDeparturesToday'] });
          queryClient.invalidateQueries({ queryKey: ['staffActiveGuests'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ['recentMessages'] });
          queryClient.invalidateQueries({ queryKey: ['contactMessages'] });

          const newMsg = payload.new;
          showToast({
            type: 'info',
            title: 'New Guest Inquiry',
            message: `Inquiry from ${newMsg?.name || 'Guest'}: "${newMsg?.subject || ''}"`,
          });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient, showToast, isStaffOrAdmin]);
}
