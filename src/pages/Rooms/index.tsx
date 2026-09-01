// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOMS CATALOG PAGE
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../../services/api';
import { RoomFilters as FiltersType, RoomCategory } from '../../types';
import { RoomCard } from '../../components/rooms/RoomCard';
import { RoomFilters } from '../../components/rooms/RoomFeatures';
import { RoomCardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { BedDouble } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [filters, setFilters] = useState<FiltersType>({
    category: 'all',
    capacity: 1,
    search: '',
  });

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => getRooms(filters),
  });

  const allRoomsCount = rooms ? rooms.length : 0;

  return (
    <div>
      <SEO
        title="Rooms & Suites"
        description="Discover our 3 floors of bespoke rooms and suites at Tahab Hotel & Suites Ltd. From Standard Rooms to our grand Presidential Suite."
      />

      {/* Hero Banner */}
      <section className="bg-emerald-950 text-warm-50 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1920&q=80"
            alt="Suites Header Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold-400 block font-sans">
            Accommodations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Our Rooms & Suites
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            Each of our rooms and suites across three floors is curated with soft luxury aesthetics, climate-controlled comfort, fast Wi-Fi, and 24/7 uninterrupted power.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters and Search Bar */}
        <RoomFilters
          filters={filters}
          onChange={setFilters}
          totalRooms={allRoomsCount}
        />

        {/* Room Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load rooms"
            description="There was an issue fetching the rooms. Please refresh the page or contact our front desk."
            action={
              <Button onClick={() => window.location.reload()} variant="gold">
                Retry
              </Button>
            }
          />
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BedDouble className="w-8 h-8" />}
            title="No rooms match your filter criteria"
            description="Try changing the category or reducing the guest count filter to see available suites."
            action={
              <Button
                variant="outline-gold"
                onClick={() => setFilters({ category: 'all', capacity: 1, search: '' })}
              >
                Clear Filters
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
};
