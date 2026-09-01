// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING PAGE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../../services/api';
import { BookingForm } from '../../components/booking/BookingForm';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { SEO } from '../../components/common/SEO';
import { Skeleton } from '../../components/common/Skeleton';
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const preRoom = searchParams.get('room') || '';
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';
  const preGuests = searchParams.get('guests') ? Number(searchParams.get('guests')) : 2;

  const [selectedRoomId, setSelectedRoomId] = useState(preRoom);
  const [checkIn, setCheckIn] = useState(
    preCheckIn || new Date().toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState(
    preCheckOut || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [guests, setGuests] = useState(preGuests);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms(),
  });

  // Set initial selected room when rooms load
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      if (!selectedRoomId || !rooms.some((r) => r.id === selectedRoomId)) {
        setSelectedRoomId(rooms[0].id);
      }
    }
  }, [rooms, selectedRoomId]);

  const activeRoom = rooms?.find((r) => r.id === selectedRoomId) || rooms?.[0];

  const handleDatesChange = (inDate: string, outDate: string, count: number) => {
    if (inDate) setCheckIn(inDate);
    if (outDate) setCheckOut(outDate);
    if (count) setGuests(count);
  };

  return (
    <div className="py-6 sm:py-8 md:py-12 bg-warm-100 min-h-[85vh]">
      <SEO
        title="Reserve Your Suite"
        description="Book your room or luxury suite directly at Tahab Hotel & Suites Ltd. Guaranteed best rates and instant confirmation."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Back Link & Header */}
        <div className="space-y-2">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Accommodations
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950">
            Book Your Stay at Tahab Hotel & Suites
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Complete the reservation details below to secure your suite. 24/7 power, complimentary breakfast, and boutique comfort.
          </p>
        </div>

        {isLoading || !rooms ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-8">
              <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Interactive Form */}
            <div className="lg:col-span-7 xl:col-span-8">
              <BookingForm
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onRoomChange={(id) => setSelectedRoomId(id)}
                onDatesChange={handleDatesChange}
              />
            </div>

            {/* Right: Real-time Dynamic Summary */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
              {activeRoom && (
                <BookingSummary
                  room={activeRoom}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guestCount={guests}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
