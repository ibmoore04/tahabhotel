// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN AMENITIES MANAGEMENT
// ==============================================================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Sparkles, Clock } from 'lucide-react';
import { getAmenities } from '../../../services/api';
import { Amenity } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { Badge } from '../../../components/common/StatusBadge';

export const AdminAmenitiesPage: React.FC = () => {
  const { data: amenities, isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => getAmenities(),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-950">
            Hotel Amenities & Social Spaces
          </h1>
          <p className="text-xs text-stone-500">
            Manage public features, operating hours, and promotional descriptions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : amenities && amenities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                <img
                  src={
                    amenity.image_url ||
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={amenity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" className="bg-emerald-950/90 text-gold-400 text-[10px]">
                    {amenity.category.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-emerald-950">
                    {amenity.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-3 mt-2 leading-relaxed">
                    {amenity.description}
                  </p>
                </div>

                {amenity.opening_hours && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-950 bg-warm-50 p-2 rounded-sm border border-stone-200">
                    <Clock className="w-3.5 h-3.5 text-gold-600" />
                    <span>{amenity.opening_hours}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No amenities listed" />
      )}
    </div>
  );
};
