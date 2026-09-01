// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING SUMMARY CARD
// ==============================================================================

import React from 'react';
import { Calendar, Users, Clock, ShieldCheck, Check, Zap } from 'lucide-react';
import { Room } from '../../types';
import { formatCurrency, formatDate, calculateNights } from '../../utils/formatters';
import { HOTEL_DETAILS } from '../../constants';

interface BookingSummaryProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  room,
  checkIn,
  checkOut,
  guestCount,
}) => {
  const nights = calculateNights(checkIn, checkOut);
  const roomTotal = room.price_per_night * nights;
  const primaryImage =
    room.images.find((i) => i.is_primary)?.image_url ||
    room.images[0]?.image_url ||
    '';

  return (
    <div className="bg-white border border-stone-200 rounded-sm shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-emerald-950 p-4 text-warm-50 border-b border-emerald-800">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400 block font-sans">
          Reservation Summary
        </span>
        <h3 className="font-serif text-lg font-bold mt-0.5">{room.name}</h3>
      </div>

      {/* Room Image Preview */}
      {primaryImage && (
        <div className="h-40 w-full overflow-hidden bg-stone-900 relative">
          <img
            src={primaryImage}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-emerald-950/90 text-gold-400 text-xs px-2.5 py-1 rounded-sm border border-gold-500/40 font-semibold backdrop-blur-sm">
            {formatCurrency(room.price_per_night)} / night
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="p-5 space-y-4 text-sm text-stone-700">
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Check-In</span>
            <span className="font-bold text-emerald-950">
              {checkIn ? formatDate(checkIn) : 'Select Date'}
            </span>
            <span className="text-[11px] text-gold-700 block">From {HOTEL_DETAILS.checkInTime}</span>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium block">Check-Out</span>
            <span className="font-bold text-emerald-950">
              {checkOut ? formatDate(checkOut) : 'Select Date'}
            </span>
            <span className="text-[11px] text-gold-700 block">Until {HOTEL_DETAILS.checkOutTime}</span>
          </div>
        </div>

        {/* Nights & Guests Count */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Calendar className="w-4 h-4 text-gold-600" />
            <span>Duration:</span>
          </div>
          <span className="font-bold text-emerald-950">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Users className="w-4 h-4 text-gold-600" />
            <span>Guests:</span>
          </div>
          <span className="font-bold text-emerald-950">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
        </div>

        {/* Inclusions */}
        <div className="bg-warm-50 p-3 rounded-sm border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <Zap className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span>24/7 Uninterrupted Electricity Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Complimentary Daily Breakfast Included</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Free High-Speed Wi-Fi & Smart TV Access</span>
          </div>
        </div>

        {/* Price Computation */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Room Rate ({nights} {nights === 1 ? 'night' : 'nights'} × {formatCurrency(room.price_per_night)})</span>
            <span>{formatCurrency(roomTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Taxes & Service Charges</span>
            <span className="text-emerald-700 font-medium">Included</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-base font-bold text-emerald-950">
            <span>Total Payable:</span>
            <span className="font-serif text-xl text-emerald-900">{formatCurrency(roomTotal)}</span>
          </div>
        </div>

        {/* Policies note */}
        <div className="pt-2 text-[11px] text-stone-500 leading-relaxed italic">
          * Strictly zero-tolerance indoor smoking policy. 24/7 Front Desk concierge available upon arrival.
        </div>
      </div>
    </div>
  );
};
