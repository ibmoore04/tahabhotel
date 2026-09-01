// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOM CARD COMPONENT
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { Room } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Badge } from '../common/StatusBadge';

interface RoomCardProps {
  room: Room;
  featured?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, featured = false }) => {
  const primaryImage =
    room.images.find((img) => img.is_primary)?.image_url ||
    room.images[0]?.image_url ||
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

  const categoryBadgeLabel = {
    standard: 'Standard & Comfort',
    executive: 'Executive Suite',
    presidential: 'Presidential Suite',
  }[room.category];

  return (
    <div className="group gold-border-card flex flex-col h-full overflow-hidden transition-all duration-300">
      {/* Image Container with Zoom Effect */}
      <div className="relative h-52 sm:h-60 md:h-72 w-full overflow-hidden bg-stone-900">
        <img
          src={primaryImage}
          alt={room.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Category Tag */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <Badge variant="gold" className="bg-emerald-950/90 text-gold-400 border-gold-500/40 backdrop-blur-md text-[10px] sm:text-xs">
            {categoryBadgeLabel}
          </Badge>
        </div>

        {/* Quick Capacity & Floor */}
        <div className="absolute bottom-2 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between text-[10px] sm:text-xs text-warm-100 font-medium">
          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-400" />
              Up to {room.capacity}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-gold-400" />
              {room.bed_type}
            </span>
          </div>

          <span className="text-[10px] sm:text-[11px] bg-gold-500/90 text-emerald-950 px-1.5 py-0.5 sm:px-2 sm:py-0.5 font-bold uppercase rounded-sm">
            Floor {room.floor}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          {room.tagline && (
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-500 mb-1">
              {room.tagline}
            </p>
          )}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-950 group-hover:text-gold-700 transition-colors">
            <Link to={`/rooms/${room.slug}`}>{room.name}</Link>
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-1.5 sm:mt-2 leading-relaxed">
            {room.description}
          </p>

          {/* Key highlights (first 3 amenities) */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-100 grid grid-cols-1 gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-stone-700">
            {room.amenities.slice(0, 3).map((amenity, i) => (
              <div key={i} className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTAs */}
        <div className="pt-3 sm:pt-4 border-t border-stone-200/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-medium">
              From / Night
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-emerald-950">
              {formatCurrency(room.price_per_night)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/rooms/${room.slug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-2.5 text-stone-700 hover:text-emerald-950 min-h-[40px] sm:min-h-[44px]"
                title="View Room Details"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>

            <Link to={`/book?room=${room.id}`}>
              <Button
                variant="gold"
                size="sm"
                rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                className="min-h-[40px] sm:min-h-[44px]"
              >
                <span className="hidden sm:inline">Book</span>
                <span className="sm:hidden">Reserve</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
