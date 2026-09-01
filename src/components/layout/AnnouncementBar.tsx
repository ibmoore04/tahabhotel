import React from 'react';
import { Sparkles, Phone, ShieldCheck, Zap } from 'lucide-react';
import { HOTEL_DETAILS } from '../../constants';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-emerald-950 text-warm-200 border-b border-emerald-900/80 text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View: Stacked */}
        <div className="md:hidden space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Zap className="w-3.5 h-3.5 shrink-0 animate-pulse text-gold-400" />
              <span className="text-xs">24/7 Power</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs">Max Security</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <a
              href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 text-stone-200 hover:text-gold-400 transition-colors font-semibold text-xs"
            >
              <Phone className="w-3 h-3 text-gold-400" />
              <span>{HOTEL_DETAILS.phones[0]}</span>
            </a>
            <span className="text-emerald-800">•</span>
            <span className="text-stone-400 text-xs">{HOTEL_DETAILS.city}</span>
          </div>
        </div>

        {/* Desktop View: Inline */}
        <div className="hidden md:flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Zap className="w-3.5 h-3.5 shrink-0 animate-pulse text-gold-400" />
              <span>24/7 Uninterrupted Power</span>
            </div>
            <span className="text-emerald-700">•</span>
            <div className="hidden md:flex items-center gap-1.5 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Maximum Security & VIP Privacy</span>
            </div>
            <span className="hidden lg:inline text-emerald-700">•</span>
            <div className="hidden lg:flex items-center gap-1.5 text-gold-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>The Rooftop Lounge & Party Destination</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 text-stone-200 hover:text-gold-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-gold-400" />
              <span>{HOTEL_DETAILS.phones[0]}</span>
            </a>
            <span className="text-emerald-800">|</span>
            <span className="text-stone-400 hidden sm:inline">{HOTEL_DETAILS.city}, Ogun State</span>
          </div>
        </div>
      </div>
    </div>
  );
};
