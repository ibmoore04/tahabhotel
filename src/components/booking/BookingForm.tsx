// ==============================================================================
// TAHAB HOTEL & SUITES LTD — BOOKING FORM COMPONENT
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { Room } from '../../types';
import { bookingFormSchema, type BookingFormValues } from '../../schemas';
import { createBooking } from '../../services/bookingService';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { getBookingErrorMessage, isRoomConflictError, isDateError } from '../../utils/bookingErrors';

interface BookingFormProps {
  rooms: Room[];
  selectedRoomId?: string;
  onRoomChange?: (roomId: string) => void;
  onDatesChange?: (checkIn: string, checkOut: string, guests: number) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  rooms,
  selectedRoomId,
  onRoomChange,
  onDatesChange,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [inlineError, setInlineError] = useState<{ title: string; message: string } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaultRoom = selectedRoomId || (rooms.length > 0 ? rooms[0].id : '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      roomId: defaultRoom,
      checkIn: today,
      checkOut: tomorrow,
      guestCount: 2,
      guestName: user?.fullName || '',
      guestEmail: user?.email || '',
      guestPhone: user?.phone || '',
      specialRequest: '',
    },
  });

  const watchedRoomId = watch('roomId');
  const watchedCheckIn = watch('checkIn');
  const watchedCheckOut = watch('checkOut');
  const watchedGuests = watch('guestCount');

  // Pre-fill user data if auth status changes
  useEffect(() => {
    if (user) {
      if (user.fullName) setValue('guestName', user.fullName);
      if (user.email) setValue('guestEmail', user.email);
      if (user.phone) setValue('guestPhone', user.phone);
    }
  }, [user, setValue]);

  // Sync external props with form
  useEffect(() => {
    if (selectedRoomId) {
      setValue('roomId', selectedRoomId);
    }
  }, [selectedRoomId, setValue]);

  useEffect(() => {
    if (onRoomChange && watchedRoomId) {
      onRoomChange(watchedRoomId);
    }
  }, [watchedRoomId, onRoomChange]);

  useEffect(() => {
    if (onDatesChange) {
      onDatesChange(watchedCheckIn, watchedCheckOut, Number(watchedGuests) || 1);
    }
  }, [watchedCheckIn, watchedCheckOut, watchedGuests, onDatesChange]);

  const onSubmit = async (data: BookingFormValues) => {
    // Clear any previous inline errors
    setInlineError(null);

    try {
      const booking = await createBooking({
        roomId: data.roomId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guestCount: Number(data.guestCount),
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        specialRequest: data.specialRequest || undefined,
      });

      showToast({
        type: 'success',
        title: 'Reservation Request Received!',
        message: `Your booking reference is #${booking.booking_reference}. We will contact you immediately.`,
      });

      navigate(`/booking/success?ref=${booking.booking_reference}`, {
        state: { booking },
      });
    } catch (err: any) {
      const errorDisplay = getBookingErrorMessage(err);

      // Show toast notification
      showToast({
        type: 'error',
        title: errorDisplay.title,
        message: errorDisplay.message,
      });

      // Show inline error for room conflict or date issues
      if (isRoomConflictError(err) || isDateError(err)) {
        setInlineError(errorDisplay);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-stone-200 rounded-sm p-4 sm:p-6 md:p-8 shadow-md space-y-5 sm:space-y-6"
    >
      <div className="border-b border-stone-200 pb-3 sm:pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
          Guest & Stay Details
        </h3>
        <p className="text-[10px] sm:text-xs text-stone-500 mt-1">
          Complete the form below to reserve your luxury stay at Tahab Hotel & Suites Ltd.
        </p>
      </div>

      {/* Step 1: Room Selection */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
          Select Suite or Room *
        </label>
        <select
          {...register('roomId')}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm font-medium text-stone-900 min-h-[44px]"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} — ₦{room.price_per_night.toLocaleString()} / night ({room.bed_type}, up to {room.capacity} guests)
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="text-xs text-rose-600 font-medium">{errors.roomId.message}</p>
        )}
      </div>

      {/* Step 2: Stay Dates & Guests */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            Check-In Date *
          </label>
          <input
            type="date"
            min={today}
            {...register('checkIn')}
            className="w-full px-3 sm:px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
          />
          {errors.checkIn && (
            <p className="text-xs text-rose-600 font-medium">{errors.checkIn.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            Check-Out Date *
          </label>
          <input
            type="date"
            min={watchedCheckIn || today}
            {...register('checkOut')}
            className="w-full px-3 sm:px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
          />
          {errors.checkOut && (
            <p className="text-xs text-rose-600 font-medium">{errors.checkOut.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
            <Users className="w-3.5 h-3.5 text-gold-600" />
            Guests *
          </label>
          <input
            type="number"
            min={1}
            max={8}
            {...register('guestCount', { valueAsNumber: true })}
            className="w-full px-3 sm:px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
          />
          {errors.guestCount && (
            <p className="text-xs text-rose-600 font-medium">{errors.guestCount.message}</p>
          )}
        </div>
      </div>

      {/* Inline Error Display for Date/Room Issues */}
      {inlineError && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 text-sm">{inlineError.title}</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{inlineError.message}</p>
          </div>
        </div>
      )}

      {/* Step 3: Guest Personal Information */}
      <div className="pt-3 sm:pt-4 border-t border-stone-200 space-y-3 sm:space-y-4">
        <h4 className="font-serif text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
          <User className="w-4 h-4 text-gold-600" />
          Primary Guest Information
        </h4>

        <div className="space-y-1.5">
          <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-700">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Chief Adebayo Balogun"
            {...register('guestName')}
            className="w-full px-3 sm:px-4 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
          />
          {errors.guestName && (
            <p className="text-xs text-rose-600 font-medium">{errors.guestName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-700">
              <Mail className="w-3.5 h-3.5 text-gold-600" />
              Email Address *
            </label>
            <input
              type="email"
              placeholder="e.g. guest@example.com"
              {...register('guestEmail')}
              className="w-full px-3 sm:px-4 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
            />
            {errors.guestEmail && (
              <p className="text-xs text-rose-600 font-medium">{errors.guestEmail.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-700">
              <Phone className="w-3.5 h-3.5 text-gold-600" />
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. +234 803 123 4567"
              {...register('guestPhone')}
              className="w-full px-3 sm:px-4 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px] sm:min-h-0"
            />
            {errors.guestPhone && (
              <p className="text-xs text-rose-600 font-medium">{errors.guestPhone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-700">
            <MessageSquare className="w-3.5 h-3.5 text-gold-600" />
            Special Requests / Dietary Preferences (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Late arrival around 8 PM, high floor preference, airport pickup arrangement..."
            {...register('specialRequest')}
            className="w-full px-3 sm:px-4 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
          />
          {errors.specialRequest && (
            <p className="text-xs text-rose-600 font-medium">{errors.specialRequest.message}</p>
          )}
        </div>
      </div>

      {/* Trust & Guarantee Box */}
      <div className="bg-emerald-950 p-3 sm:p-4 rounded-sm text-warm-100 text-[10px] sm:text-xs space-y-1.5 sm:space-y-2 border border-emerald-800">
        <div className="flex items-center gap-2 text-gold-400 font-bold">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Guaranteed Reservation Policy</span>
        </div>
        <p className="text-stone-300 leading-relaxed">
          Your room is held immediately upon submission. Server-side price calculation guarantees the quoted rate is honored without hidden charges.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="gold"
        size="lg"
        isLoading={isSubmitting}
        className="w-full justify-center shadow-gold-md py-3.5 sm:py-4 text-sm font-bold min-h-[48px]"
      >
        Confirm & Reserve Stay
      </Button>
    </form>
  );
};
