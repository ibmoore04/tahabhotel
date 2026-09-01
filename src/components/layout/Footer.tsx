// ==============================================================================
// TAHAB HOTEL & SUITES LTD — FOOTER COMPONENT
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { HOTEL_DETAILS, NAV_LINKS } from '../../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-warm-200 border-t border-emerald-800/80 pt-10 sm:pt-12 md:pt-16 pb-24 sm:pb-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 lg:gap-12 mb-6 sm:mb-8 lg:mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 select-none">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-sm bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-emerald-950 shadow-gold-sm">
                <Crown className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-warm-50 block leading-tight">
                  TAHAB
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-gold-400 font-sans block">
                  Hotel & Suites Ltd
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {HOTEL_DETAILS.subheadline}
            </p>

            <div className="flex items-center gap-3 pt-1 sm:pt-2">
              <a
                href={HOTEL_DETAILS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-sm bg-emerald-900 border border-emerald-700/60 flex items-center justify-center text-gold-400 hover:text-warm-50 hover:bg-gold-500 hover:border-gold-500 transition-all active:scale-95"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={HOTEL_DETAILS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-sm bg-emerald-900 border border-emerald-700/60 flex items-center justify-center text-gold-400 hover:text-warm-50 hover:bg-gold-500 hover:border-gold-500 transition-all active:scale-95"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-gold-400 mb-3 sm:mb-4 font-sans">
              Quick Navigation
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-300">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="hover:text-gold-300 transition-colors flex items-center gap-2 group active:text-gold-300 py-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500 group-hover:w-2 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/book"
                  className="hover:text-gold-300 transition-colors flex items-center gap-2 group font-semibold text-gold-400 active:text-gold-200 py-1"
                >
                  <span className="w-1 h-1 rounded-full bg-gold-500 group-hover:w-2 transition-all" />
                  Instant Room Reservation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Signature Experiences */}
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-gold-400 mb-3 sm:mb-4 font-sans">
              Signature Experiences
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-300">
              <li>
                <Link to="/amenities" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1 block">
                  The Rooftop Lounge & Party Hub
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1 block">
                  Authentic Nigerian & Continental Dining
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1 block">
                  Executive Boardroom & Meeting Suites
                </Link>
              </li>
              <li>
                <Link to="/rooms/presidential-suite" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1 block">
                  Presidential Suite VIP Experience
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1 block">
                  Guest Policies & 24/7 Front Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-gold-400 mb-3 sm:mb-4 font-sans">
              Contact & Location
            </h4>
            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{HOTEL_DETAILS.address}</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  {HOTEL_DETAILS.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="hover:text-gold-300 transition-colors font-medium active:text-gold-300 py-1"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${HOTEL_DETAILS.email}`}
                  className="hover:text-gold-300 transition-colors active:text-gold-300 text-xs sm:text-sm py-1"
                >
                  {HOTEL_DETAILS.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Perks Highlights Banner - Mobile Optimized */}
        <div className="py-3 sm:py-4 md:py-6 border-y border-emerald-900 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs text-stone-300 mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs">24/7 Power</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs">Security</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs">Boutique</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs">Breakfast</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Tahab Hotel & Suites Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <Link to="/policies" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1">
              Hotel Policies
            </Link>
            <Link to="/contact" className="hover:text-gold-300 transition-colors active:text-gold-300 py-1">
              Get Directions
            </Link>
            <Link to="/login" className="hover:text-gold-300 transition-colors text-stone-500 active:text-gold-300 py-1">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
