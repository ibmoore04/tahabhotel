// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOM FEATURES & FILTERS
// ==============================================================================

import React from 'react';
import {
  Wifi,
  Tv,
  Coffee,
  Wind,
  ShieldCheck,
  Sparkles,
  Bath,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';
import { RoomCategory, RoomFilters as FiltersType } from '../../types';

interface RoomFeaturesProps {
  amenities: string[];
}

export const RoomFeatures: React.FC<RoomFeaturesProps> = ({ amenities }) => {
  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-5 h-5 text-gold-500" />;
    if (lower.includes('tv') || lower.includes('entertainment')) return <Tv className="w-5 h-5 text-gold-500" />;
    if (lower.includes('air') || lower.includes('ac')) return <Wind className="w-5 h-5 text-gold-500" />;
    if (lower.includes('coffee') || lower.includes('breakfast') || lower.includes('tea'))
      return <Coffee className="w-5 h-5 text-gold-500" />;
    if (lower.includes('bath') || lower.includes('shower') || lower.includes('water'))
      return <Bath className="w-5 h-5 text-gold-500" />;
    if (lower.includes('security') || lower.includes('keycard'))
      return <ShieldCheck className="w-5 h-5 text-gold-500" />;
    return <Sparkles className="w-5 h-5 text-gold-500" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {amenities.map((amenity, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3.5 p-3.5 rounded-sm bg-warm-50 border border-stone-200/80 hover:border-gold-500/40 transition-all shadow-sm"
        >
          <div className="p-2 rounded-sm bg-emerald-950 text-gold-400 shrink-0">
            {getAmenityIcon(amenity)}
          </div>
          <div>
            <span className="text-sm font-medium text-emerald-950 block">
              {amenity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface RoomFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  totalRooms: number;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({
  filters,
  onChange,
  totalRooms,
}) => {
  const categories: { label: string; value: RoomCategory | 'all' }[] = [
    { label: 'All Rooms & Suites', value: 'all' },
    { label: 'Standard & Mini Suites', value: 'standard' },
    { label: 'Executive Suites', value: 'executive' },
    { label: 'Presidential Suites', value: 'presidential' },
  ];

  return (
    <div className="bg-white border border-stone-200/90 rounded-sm p-4 sm:p-6 shadow-sm mb-8 space-y-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onChange({ ...filters, category: cat.value })}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                filters.category === cat.value
                  ? 'bg-emerald-950 text-gold-400 border border-gold-500 shadow-sm'
                  : 'bg-warm-50 text-stone-700 border border-stone-200 hover:bg-stone-100 hover:text-emerald-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rooms or features..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-stone-800"
          />
        </div>
      </div>

      {/* Guest count & Price filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Min Guests:</span>
            <select
              value={filters.capacity || 1}
              onChange={(e) =>
                onChange({ ...filters, capacity: Number(e.target.value) })
              }
              aria-label="Filter by Minimum Guests"
              className="bg-warm-50 border border-stone-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gold-500"
            >
              <option value={1}>1+ Guests</option>
              <option value={2}>2+ Guests</option>
              <option value={3}>3+ Guests</option>
              <option value={4}>4+ Guests</option>
            </select>
          </div>
        </div>

        <div className="text-stone-500 font-medium">
          Showing <span className="font-bold text-emerald-950">{totalRooms}</span> available suites
        </div>
      </div>
    </div>
  );
};
