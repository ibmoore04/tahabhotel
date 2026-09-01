// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AMENITIES & EXPERIENCES PAGE
// ==============================================================================

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '../../services/api';
import { AmenityCard } from '../../components/amenities/AmenityCard';
import { SectionHeading } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';
import { Skeleton } from '../../components/common/Skeleton';

export const AmenitiesPage: React.FC = () => {
  const { data: amenities, isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => getAmenities(),
  });

  const diningAndNightlife = amenities?.filter((a) =>
    ['dining', 'entertainment'].includes(a.category)
  ) || [];

  const businessAndWellness = amenities?.filter((a) =>
    ['business', 'wellness', 'general'].includes(a.category)
  ) || [];

  return (
    <div>
      <SEO
        title="Amenities & Experiences"
        description="Explore the signature facilities at Tahab Hotel & Suites Ltd: The Rooftop Lounge, Restaurant & Bar, Corporate Boardroom, In-house Gym and VIP Lounges."
      />

      {/* Hero Banner */}
      <section className="bg-emerald-950 text-warm-50 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Amenities Header Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold-400 block font-sans">
            Facilities & Lifestyle
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Hotel Amenities & Experiences
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            Indulge in world-class amenities designed to elevate your stay. From vibrant rooftop celebrations to secluded corporate boardrooms and fine dining.
          </p>
        </div>
      </section>

      {/* Main Sections */}
      <div className="py-16 md:py-24 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Dining & Nightlife */}
        <div className="space-y-10">
          <SectionHeading
            tagline="Celebrations & Culinary"
            title="Dining & Nightlife"
            subtitle="Exceptional social spaces crafted for vibrant memories, cocktail evenings, and gourmet dining in Ijebu Ode."
          />

          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-12">
              {diningAndNightlife.map((amenity, idx) => (
                <AmenityCard
                  key={amenity.id}
                  amenity={amenity}
                  reverse={idx % 2 === 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Business & Wellness */}
        <div className="space-y-10 pt-8 border-t border-stone-200">
          <SectionHeading
            tagline="Productivity & Vitality"
            title="Business & Wellness"
            subtitle="Executive meeting environments and invigorating fitness options to keep you performing at your peak."
          />

          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-12">
              {businessAndWellness.map((amenity, idx) => (
                <AmenityCard
                  key={amenity.id}
                  amenity={amenity}
                  reverse={idx % 2 === 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
