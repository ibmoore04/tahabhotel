// ==============================================================================
// TAHAB HOTEL & SUITES LTD — GUEST ACCOUNT & BOOKINGS PORTAL
// ==============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Calendar,
  Phone,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Save,
  Hotel,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getMyBookings, cancelMyBooking } from '../../services/bookingService';
import { updateMyProfile } from '../../services/guestService';
import { formatCurrency, formatDate, calculateNights } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton, EmptyState } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';
import type { Booking } from '../../types';

export const AccountPage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => getMyBookings(),
    enabled: Boolean(user),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      cancelMyBooking(bookingId, user?.id || '', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      showToast({
        type: 'success',
        title: 'Booking Cancelled',
        message: 'Your reservation has been cancelled.',
      });
      setCancelModalBooking(null);
      setCancelReason('');
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err?.message || 'Could not cancel booking.',
      });
    },
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateMyProfile(user.id, { fullName, phone });
      await refreshUser();
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your contact details have been updated.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not update profile.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const upcomingBookings = (bookings ?? []).filter((b) =>
    ['pending', 'confirmed'].includes(b.status)
  );
  const pastBookings = (bookings ?? []).filter((b) =>
    ['checked_in', 'checked_out', 'cancelled', 'rejected'].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-warm-100 py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="My Account | Tahab Hotel & Suites" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Banner */}
        <div className="bg-emerald-950 text-warm-50 p-6 sm:p-8 rounded-sm shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-serif text-xl font-bold">
              {user?.fullName?.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight">
                  {user?.fullName || 'Valued Guest'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-full">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <a href="/admin">
                <Button variant="gold" size="sm">
                  Admin Dashboard
                </Button>
              </a>
            )}
            {user?.role === 'staff' && (
              <a href="/staff">
                <Button variant="gold" size="sm">
                  Staff Portal
                </Button>
              </a>
            )}
            <Button
              variant="outline-white"
              size="sm"
              onClick={() => signOut()}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-gold-500 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-emerald-950'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Reservations ({bookings?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-gold-500 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-emerald-950'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Settings</span>
          </button>
        </div>

        {/* Tab: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* Upcoming Reservations */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-600" />
                <span>Upcoming & Active Stays</span>
              </h2>

              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-4 hover:border-gold-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-950 block">
                            #{b.booking_reference}
                          </span>
                          <h3 className="font-serif text-base font-bold text-emerald-950 mt-0.5">
                            {b.room?.name || 'Standard Luxury Room'}
                          </h3>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-warm-50 p-3 rounded-sm">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">Check-In</span>
                          <span className="font-semibold text-stone-900">{formatDate(b.check_in)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">Check-Out</span>
                          <span className="font-semibold text-stone-900">{formatDate(b.check_out)}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-stone-200/60 flex justify-between">
                          <span>{calculateNights(b.check_in, b.check_out)} Night(s) Stay</span>
                          <span className="font-serif font-bold text-emerald-950">
                            {formatCurrency(b.total_price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                          className="text-xs"
                        >
                          View Details
                        </Button>

                        {b.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelModalBooking(b)}
                            className="text-rose-600 hover:text-rose-800 text-xs"
                          >
                            Cancel Stay
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No upcoming reservations"
                  description="Explore our boutique rooms in Ijebu Ode and book your next luxury stay."
                />
              )}
            </div>

            {/* Past & History */}
            {pastBookings.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h2 className="font-serif text-lg font-bold text-emerald-950">
                  Stay History
                </h2>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {pastBookings.map((b) => (
                    <div key={b.id} className="bg-white border border-stone-200 rounded-sm p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-emerald-950 block text-sm">
                            #{b.booking_reference}
                          </span>
                          <span className="font-semibold text-stone-800 block text-xs">
                            {b.room?.name || 'Hotel Room'}
                          </span>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="text-xs text-stone-600 pt-2 border-t border-stone-100">
                        {formatDate(b.check_in)} → {formatDate(b.check_out)}
                        <span className="block font-serif font-bold text-emerald-950 mt-1">
                          {formatCurrency(b.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block bg-white border border-stone-200 rounded-sm overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Stay Dates</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pastBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-warm-50/50">
                          <td className="p-4 font-mono font-bold text-emerald-950">
                            #{b.booking_reference}
                          </td>
                          <td className="p-4 font-semibold text-stone-800">
                            {b.room?.name || 'Hotel Room'}
                          </td>
                          <td className="p-4 text-stone-600">
                            {formatDate(b.check_in)} → {formatDate(b.check_out)}
                          </td>
                          <td className="p-4 font-serif font-bold text-emerald-950">
                            {formatCurrency(b.total_price)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md max-w-2xl space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-emerald-950">
                Guest Profile & Information
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Keep your contact details up to date for smooth check-in and booking communications.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-300 rounded-sm text-sm text-stone-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-stone-400 block">
                  Email cannot be changed directly. Contact support if needed.
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+234 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                />
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="md"
                isLoading={isSavingProfile}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details #${selectedBooking.booking_reference}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-center justify-between bg-warm-50 p-3 rounded-sm border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Status</span>
                <StatusBadge status={selectedBooking.status} className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total</span>
                <span className="font-serif text-base font-bold text-emerald-950">
                  {formatCurrency(selectedBooking.total_price)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-stone-900 block text-sm">
                {selectedBooking.room?.name || 'Standard Luxury Room'}
              </span>
              <p className="text-stone-600">
                {formatDate(selectedBooking.check_in)} to {formatDate(selectedBooking.check_out)} (
                {calculateNights(selectedBooking.check_in, selectedBooking.check_out)} nights)
              </p>
              <p className="text-stone-600">
                Guest Count: {selectedBooking.guest_count} person(s)
              </p>
              {selectedBooking.special_request && (
                <div className="bg-warm-50 p-2.5 rounded-sm border border-stone-200 mt-2">
                  <span className="font-bold block text-[11px]">Special Request:</span>
                  <p className="italic text-stone-600">"{selectedBooking.special_request}"</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={Boolean(cancelModalBooking)}
          onClose={() => setCancelModalBooking(null)}
          title="Cancel Reservation"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-stone-700">
            <p className="leading-relaxed">
              Are you sure you want to cancel reservation{' '}
              <strong className="font-mono text-emerald-950">
                #{cancelModalBooking.booking_reference}
              </strong>{' '}
              ({cancelModalBooking.room?.name})?
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelModalBooking(null)}
              >
                Keep Reservation
              </Button>
              <Button
                variant="emerald"
                size="sm"
                isLoading={cancelMutation.isPending}
                onClick={() =>
                  cancelMutation.mutate({
                    bookingId: cancelModalBooking.id,
                    reason: cancelReason,
                  })
                }
                className="bg-rose-700 hover:bg-rose-800 text-white"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
