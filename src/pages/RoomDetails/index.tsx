// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOM DETAILS PAGE
// ==============================================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Bed,
  Layers,
  Maximize,
  ArrowLeft,
  Calendar,
  Check,
  ShieldCheck,
  Zap,
  Phone,
} from 'lucide-react';
import { getRoomBySlug } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { HOTEL_DETAILS } from '../../constants';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/StatusBadge';
import { RoomGallery } from '../../components/rooms/RoomGallery';
import { RoomFeatures } from '../../components/rooms/RoomFeatures';
import { Skeleton, EmptyState } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';

export const RoomDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [guests, setGuests] = useState('2');

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', slug],
    queryFn: () => getRoomBySlug(slug || ''),
    enabled: Boolean(slug),
  });

  const handleInstantBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    navigate(`/book?room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <EmptyState
          title="Room Not Found"
          description="The requested room or suite does not exist or may have been updated."
          action={
            <Link to="/rooms">
              <Button variant="gold" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Rooms
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 md:py-12">
      <SEO
        title={room.name}
        description={room.description}
        image={room.images[0]?.image_url}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Rooms & Suites
          </Link>

          <Badge variant="gold" className="uppercase font-bold tracking-wider self-start sm:self-auto">
            Floor {room.floor} • {room.category.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Main Left Content: Gallery + Overview + Features */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Gallery Carousel */}
            <RoomGallery images={room.images} roomName={room.name} />

            {/* Room Header Info */}
            <div className="border-b border-stone-200 pb-5 sm:pb-6 lg:pb-8 space-y-3 sm:space-y-4">
              {room.tagline && (
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] sm:tracking-[0.25em] text-gold-700 font-sans block">
                  {room.tagline}
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950">
                {room.name}
              </h1>

              {/* Key Specs Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 pt-2 text-[10px] sm:text-xs text-stone-700 font-medium">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-warm-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-stone-200">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  <span>Up to {room.capacity} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-warm-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-stone-200">
                  <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  <span>{room.bed_type}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-warm-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-stone-200">
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  <span>Floor {room.floor}</span>
                </div>
                {room.size_sqm && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-warm-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-stone-200">
                    <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                    <span>{room.size_sqm} m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Room Description */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
                Suite Overview & Experience
              </h2>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                {room.description}
              </p>
            </div>

            {/* Room Amenities & Features */}
            <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4 border-t border-stone-200">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
                Room Features & Amenities
              </h2>
              <RoomFeatures amenities={room.amenities} />
            </div>

            {/* Inclusions & Policies Box */}
            <div className="bg-emerald-950 text-warm-100 p-4 sm:p-5 lg:p-6 rounded-sm space-y-3 sm:space-y-4 border border-emerald-800">
              <h3 className="font-serif text-base sm:text-lg font-bold text-warm-50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                Inclusions & Hotel Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                  <span>24/7 Uninterrupted Electricity Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Daily Complimentary Fresh Breakfast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>High-Speed Optical Fiber Internet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Strict Zero-Tolerance Indoor Smoking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Booking Box */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 sm:top-24 bg-white border border-stone-200 rounded-sm shadow-xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div className="border-b border-stone-200 pb-3 sm:pb-4">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-500 block">
                  Nightly Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-950">
                    {formatCurrency(room.price_per_night)}
                  </span>
                  <span className="text-xs text-stone-500">/ night</span>
                </div>
              </div>

              {/* Instant Booking Form */}
              <form onSubmit={handleInstantBook} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 min-h-[44px] sm:min-h-0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 min-h-[44px] sm:min-h-0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 min-h-[44px] sm:min-h-0"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  className="w-full justify-center shadow-gold-sm py-3 sm:py-3.5 min-h-[48px]"
                >
                  Reserve This Suite
                </Button>
              </form>

              {/* Direct Telephone CTA */}
              <div className="pt-3 sm:pt-4 border-t border-stone-200 text-center space-y-2">
                <p className="text-[10px] sm:text-xs text-stone-500">Prefer direct telephone reservation?</p>
                <a
                  href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 hover:text-gold-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-gold-600" />
                  <span>{HOTEL_DETAILS.phones[0]}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
