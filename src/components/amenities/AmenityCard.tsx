// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AMENITY CARD COMPONENT
// ==============================================================================

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { Amenity } from '../../types';
import { Badge } from '../common/StatusBadge';

interface AmenityCardProps {
  amenity: Amenity;
  reverse?: boolean;
}

export const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, reverse = false }) => {
  return (
    <div
      className={`gold-border-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-center ${
        reverse ? 'lg:flex-row-reverse' : ''
      }`}
    >
      {/* Image half */}
      <div
        className={`relative h-72 lg:h-96 w-full overflow-hidden bg-stone-900 ${
          reverse ? 'lg:col-span-6 lg:order-2' : 'lg:col-span-6 lg:order-1'
        }`}
      >
        <img
          src={
            amenity.image_url ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
          }
          alt={amenity.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4">
          <Badge variant="gold" className="bg-emerald-950/90 text-gold-400 border-gold-500/40 backdrop-blur-sm">
            {amenity.category.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Text half */}
      <div
        className={`p-8 lg:p-12 space-y-4 ${
          reverse ? 'lg:col-span-6 lg:order-1' : 'lg:col-span-6 lg:order-2'
        }`}
      >
        <div className="flex items-center gap-2 text-gold-600 font-semibold text-xs tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tahab Signature Experience</span>
        </div>

        <h3 className="font-serif text-2xl lg:text-3xl font-bold text-emerald-950">
          {amenity.name}
        </h3>

        <div className="gold-divider !my-2" />

        <p className="text-stone-600 leading-relaxed text-sm md:text-base">
          {amenity.description}
        </p>

        {amenity.opening_hours && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950 bg-warm-50 p-3 rounded-sm border border-stone-200/80 w-fit">
            <Clock className="w-4 h-4 text-gold-600" />
            <span>Hours: {amenity.opening_hours}</span>
          </div>
        )}
      </div>
    </div>
  );
};
