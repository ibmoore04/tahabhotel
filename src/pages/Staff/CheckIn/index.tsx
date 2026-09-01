// ==============================================================================
// TAHAB HOTEL & SUITES LTD — FAST GUEST CHECK-IN WORKFLOW
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, UserCheck, Key, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { getBookingByReference, transitionBookingStatus } from '../../../services/bookingService';
import { formatCurrency, formatDate, calculateNights } from '../../../utils/formatters';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SEO } from '../../../components/common/SEO';
import type { Booking } from '../../../types';

export const StaffCheckInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [refInput, setRefInput] = useState(searchParams.get('ref') || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const searchBooking = async (ref: string) => {
    if (!ref.trim()) return;
    setIsSearching(true);
    try {
      const result = await getBookingByReference(ref);
      if (!result) {
        showToast({
          type: 'error',
          title: 'Not Found',
          message: `No reservation found with reference "${ref}".`,
        });
        setBooking(null);
      } else {
        setBooking(result);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Lookup Error',
        message: err?.message || 'Failed to search booking.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const initialRef = searchParams.get('ref');
    if (initialRef) {
      searchBooking(initialRef);
    }
  }, [searchParams]);

  const handleCheckIn = async () => {
    if (!booking) return;
    if (!idVerified) {
      showToast({
        type: 'info',
        title: 'Verification Required',
        message: 'Please confirm guest identity verification before proceeding.',
      });
      return;
    }

    setIsCheckingIn(true);
    try {
      await transitionBookingStatus(booking.id, 'checked_in', user?.id);
      showToast({
        type: 'success',
        title: 'Check-In Complete',
        message: `Guest ${booking.guest_name} successfully checked into ${booking.room?.name}.`,
      });
      setBooking({ ...booking, status: 'checked_in' });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Check-In Failed',
        message: err?.message || 'Could not complete check-in.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SEO title="Fast Check-In | Staff Portal" />

      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Fast Guest Check-In
        </h1>
        <p className="text-xs text-stone-500">
          Lookup booking by reference number, verify identity, confirm room readiness and issue keycards.
        </p>
      </div>

      {/* Reference Lookup Bar */}
      <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchBooking(refInput);
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Booking Reference (e.g. THB-XXXXXX)..."
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm uppercase font-mono bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900"
            />
          </div>
          <Button
            type="submit"
            variant="gold"
            size="md"
            isLoading={isSearching}
            className="px-6 font-bold"
          >
            Lookup
          </Button>
        </form>
      </div>

      {/* Booking Details Card */}
      {booking && (
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
            <div>
              <span className="font-mono text-xs uppercase text-stone-400 block">Reference</span>
              <span className="font-mono text-2xl font-bold text-emerald-950 block">
                #{booking.booking_reference}
              </span>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
            <div className="space-y-3">
              <h3 className="font-bold text-stone-500 uppercase tracking-wider">
                Guest Identity
              </h3>
              <div className="bg-warm-50 p-4 rounded-sm border border-stone-200 space-y-1.5">
                <span className="text-stone-400 block text-[10px] uppercase">Full Name</span>
                <p className="font-bold text-stone-900 text-base">{booking.guest_name}</p>
                <p className="text-stone-600">Phone: {booking.guest_phone}</p>
                <p className="text-stone-600">Email: {booking.guest_email}</p>
                <p className="text-stone-600">Guest Count: {booking.guest_count} Person(s)</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-stone-500 uppercase tracking-wider">
                Reserved Accommodation
              </h3>
              <div className="bg-warm-50 p-4 rounded-sm border border-stone-200 space-y-1.5">
                <span className="text-stone-400 block text-[10px] uppercase">Room / Suite</span>
                <p className="font-bold text-emerald-950 text-base">{booking.room?.name}</p>
                <p className="text-stone-600">
                  Stay: {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                </p>
                <p className="font-serif font-bold text-emerald-950 text-sm">
                  Total Payable: {formatCurrency(booking.total_price)}
                </p>
              </div>
            </div>
          </div>

          {booking.special_request && (
            <div className="bg-warm-50 p-3 rounded-sm border border-stone-200 text-xs">
              <span className="font-bold text-stone-600 uppercase block text-[10px]">
                Special Request from Guest:
              </span>
              <p className="italic text-stone-700 mt-0.5">"{booking.special_request}"</p>
            </div>
          )}

          {/* Action Area */}
          {booking.status === 'confirmed' ? (
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={idVerified}
                    onChange={(e) => setIdVerified(e.target.checked)}
                    className="w-4 h-4 text-emerald-950 rounded border-stone-300 focus:ring-gold-500"
                  />
                  <span>Physical / Government ID verified at reception desk</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={paymentVerified}
                    onChange={(e) => setPaymentVerified(e.target.checked)}
                    className="w-4 h-4 text-emerald-950 rounded border-stone-300 focus:ring-gold-500"
                  />
                  <span>Payment / Card pre-authorization confirmed</span>
                </label>
              </div>

              <Button
                variant="emerald"
                size="md"
                isLoading={isCheckingIn}
                onClick={handleCheckIn}
                leftIcon={<Key className="w-4 h-4" />}
                className="w-full justify-center py-3 font-bold text-sm"
              >
                Complete Check-In & Issue Keycard
              </Button>
            </div>
          ) : booking.status === 'checked_in' ? (
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Guest is currently checked-in and active in-house.</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await transitionBookingStatus(booking.id, 'checked_out', user?.id);
                  setBooking({ ...booking, status: 'checked_out' });
                  showToast({ type: 'success', title: 'Check-Out Processed', message: 'Guest has been checked out.' });
                }}
                className="border border-stone-300 text-xs"
              >
                Process Check-Out
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <span>This booking is in <strong className="uppercase">{booking.status}</strong> status.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/staff/bookings')}
              >
                Back to Bookings
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
