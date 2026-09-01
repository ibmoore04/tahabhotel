// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING SUCCESS & CONFIRMATION RECEIPT
// ==============================================================================

import React from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  Printer,
  Home,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getBookingByReference } from '../../services/api';
import { formatCurrency, formatDate, calculateNights } from '../../utils/formatters';
import { HOTEL_DETAILS } from '../../constants';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';

export const BookingSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const refParam = searchParams.get('ref') || '';
  const initialBooking = location.state?.booking;

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', refParam],
    queryFn: () => getBookingByReference(refParam),
    initialData: initialBooking,
    enabled: Boolean(refParam && !initialBooking),
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 md:py-16 bg-warm-100 min-h-[85vh]">
      <SEO
        title="Booking Confirmation"
        description="Your reservation at Tahab Hotel & Suites Ltd has been received."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-900 text-gold-400 border-2 border-gold-500/50 flex items-center justify-center mx-auto shadow-gold-sm animate-fade-in">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="section-tagline !mb-0">Reservation Received</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-950">
            Thank You For Choosing Tahab!
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Your reservation request has been registered in our hotel management system. A confirmation receipt is shown below.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : booking ? (
          <div className="bg-white border border-stone-200 rounded-sm shadow-xl overflow-hidden print:border-none print:shadow-none">
            {/* Header with Reference Code */}
            <div className="bg-emerald-950 text-warm-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400 block font-sans">
                  Booking Reference Number
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-warm-100">
                  {booking.booking_reference}
                </span>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Receipt Details Body */}
            <div className="p-6 sm:p-8 space-y-6 text-sm text-stone-700">
              {/* Room and Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-stone-200">
                <div>
                  <span className="text-xs uppercase font-semibold text-stone-500 block">
                    Reserved Accommodation
                  </span>
                  <h3 className="font-serif text-xl font-bold text-emerald-950 mt-1">
                    {booking.room?.name || 'Selected Suite'}
                  </h3>
                  <span className="text-xs text-gold-700 font-medium block mt-0.5">
                    {booking.room?.bed_type} • Up to {booking.room?.capacity} Guests
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase font-semibold text-stone-500 block">
                    Total Duration
                  </span>
                  <span className="font-serif text-xl font-bold text-emerald-950 mt-1 block">
                    {calculateNights(booking.check_in, booking.check_out)}{' '}
                    {calculateNights(booking.check_in, booking.check_out) === 1
                      ? 'Night'
                      : 'Nights'}
                  </span>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                  </span>
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <h4 className="font-serif text-base font-bold text-emerald-950">
                  Guest Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 font-medium block">Guest Name</span>
                    <span className="font-bold text-emerald-950 text-sm">{booking.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Email Address</span>
                    <span className="font-semibold text-stone-800">{booking.guest_email}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Phone Number</span>
                    <span className="font-semibold text-stone-800">{booking.guest_phone}</span>
                  </div>
                </div>

                {booking.special_request && (
                  <div className="pt-2 text-xs">
                    <span className="text-stone-500 font-medium block">Special Requests</span>
                    <p className="text-stone-700 italic mt-0.5">"{booking.special_request}"</p>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 pb-6 border-b border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Room Stay Charge</span>
                  <span>{formatCurrency(booking.total_price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Complimentary Breakfast</span>
                  <span className="text-emerald-700 font-medium">Included</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>24/7 Power & Security Surcharge</span>
                  <span className="text-emerald-700 font-medium">Included</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-lg font-bold text-emerald-950">
                  <span>Total Amount:</span>
                  <span className="font-serif text-2xl text-emerald-900">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
              </div>

              {/* Check-In Instructions */}
              <div className="bg-warm-50 p-4 rounded-sm border border-stone-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>Check-In & Payment Instructions</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Please present your booking reference (<strong>{booking.booking_reference}</strong>) upon arrival. Check-in commences at <strong>{HOTEL_DETAILS.checkInTime}</strong>. Settlement may be made via POS card payment or bank transfer at the front desk.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-sm text-center space-y-4">
            <h3 className="font-serif text-xl font-bold text-emerald-950">
              Booking details retrieved.
            </h3>
            <p className="text-xs text-stone-500">
              We look forward to hosting you at Tahab Hotel & Suites Ltd.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 print:hidden">
          <Button
            variant="outline-gold"
            size="md"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Receipt
          </Button>

          <a href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}>
            <Button
              variant="emerald"
              size="md"
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Call Front Desk
            </Button>
          </a>

          <Link to="/">
            <Button variant="gold" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
