import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Phone, ArrowRight } from 'lucide-react';
import { HOTEL_DETAILS } from '../../constants';

export const StickyMobileBookingBar: React.FC = () => {
  const location = useLocation();

  // Hide on booking page itself or admin/staff portals
  if (
    location.pathname.startsWith('/book') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff')
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Quick Actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-emerald-950 via-emerald-950/95 to-emerald-950/90 backdrop-blur-md border-t border-emerald-800/80 p-3 shadow-2xl animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Call Button */}
        <a
          href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}
          className="flex items-center justify-center p-3 rounded-sm bg-emerald-900/60 border border-emerald-700/80 text-gold-400 hover:text-warm-50 hover:bg-emerald-900 hover:border-gold-500 transition-all active:scale-95 shrink-0 min-w-[48px]"
          aria-label="Call Front Desk"
          title="Call Tahab Hotel"
        >
          <Phone className="w-5 h-5" />
        </a>

        {/* Book Button */}
        <Link
          to="/book"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-emerald-950 font-bold uppercase text-xs tracking-wider shadow-gold-md hover:shadow-gold-lg hover:brightness-105 active:scale-[0.98] transition-all min-h-[48px]"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};
