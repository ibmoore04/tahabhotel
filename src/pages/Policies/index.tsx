// ==============================================================================
// TAHAB HOTEL & SUITES LTD — HOTEL POLICIES PAGE
// ==============================================================================

import React from 'react';
import {
  Clock,
  Ban,
  AlertOctagon,
  Phone,
} from 'lucide-react';
import { HOTEL_DETAILS } from '../../constants';
import { SEO } from '../../components/common/SEO';

export const PoliciesPage: React.FC = () => {
  return (
    <div>
      <SEO
        title="Hotel Policies & Guidelines"
        description="Review the official guest policies for Tahab Hotel & Suites Ltd. 24/7 Front Desk operations and our strict zero-tolerance indoor smoking policy."
      />

      {/* Hero Banner */}
      <section className="bg-emerald-950 text-warm-50 py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold-400 block font-sans">
            Terms & Comfort Standards
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Hotel Policies & Guidelines
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            Our guest policies are established to guarantee a pristine, secure, and serene boutique hotel environment for every visitor.
          </p>
        </div>
      </section>

      {/* Policies Content */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Policy 1: Front Desk Operations */}
        <div className="bg-white p-8 md:p-10 rounded-sm border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-gold-600">
            <Clock className="w-6 h-6" />
            <h2 className="font-serif text-2xl font-bold text-emerald-950">
              Front Desk & Concierge Operations
            </h2>
          </div>
          <div className="gold-divider !my-2" />
          <p className="text-stone-700 leading-relaxed text-sm md:text-base">
            The front desk at Tahab Hotel & Suites Ltd operates <strong>24 hours a day, 7 days a week</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-stone-700">
            <div className="p-4 bg-warm-50 border border-stone-200 rounded-sm">
              <span className="font-bold text-emerald-950 block text-sm">Standard Check-In</span>
              <span className="text-stone-600 mt-1 block">From {HOTEL_DETAILS.checkInTime}</span>
            </div>
            <div className="p-4 bg-warm-50 border border-stone-200 rounded-sm">
              <span className="font-bold text-emerald-950 block text-sm">Standard Check-Out</span>
              <span className="text-stone-600 mt-1 block">Until {HOTEL_DETAILS.checkOutTime}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 pt-1">
            Early check-in and late check-out can be requested in advance through our front desk team, subject to room availability.
          </p>
        </div>

        {/* Policy 2: Strict Zero-Tolerance Indoor Smoking Policy */}
        <div className="bg-white p-8 md:p-10 rounded-sm border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-rose-700">
            <Ban className="w-6 h-6" />
            <h2 className="font-serif text-2xl font-bold text-emerald-950">
              Strict Zero-Tolerance Indoor Smoking Policy
            </h2>
          </div>
          <div className="gold-divider !my-2" />

          <p className="text-stone-700 leading-relaxed text-sm md:text-base font-medium">
            Tahab Hotel & Suites Ltd maintains a <strong>strict zero-tolerance indoor smoking policy</strong>.
          </p>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
              <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Prohibited Indoors Without Exception:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-rose-950 font-medium">
              <li>Cigarette & Tobacco Smoking</li>
              <li>Vaping & E-Cigarettes</li>
              <li>Marijuana & Cannabis Use</li>
            </ul>
          </div>

          <div className="space-y-2 text-xs text-stone-700">
            <p className="font-bold uppercase tracking-wider text-stone-800">
              This strict policy applies across all indoor spaces:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <span className="p-2.5 bg-warm-50 border border-stone-200 rounded-sm font-semibold text-emerald-950">
                Guest Rooms
              </span>
              <span className="p-2.5 bg-warm-50 border border-stone-200 rounded-sm font-semibold text-emerald-950">
                Suites
              </span>
              <span className="p-2.5 bg-warm-50 border border-stone-200 rounded-sm font-semibold text-emerald-950">
                Restrooms
              </span>
              <span className="p-2.5 bg-warm-50 border border-stone-200 rounded-sm font-semibold text-emerald-950">
                Indoor Hallways
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-950 text-warm-100 rounded-sm text-xs space-y-1 border border-emerald-800">
            <span className="font-bold text-gold-400 block">Designated Outdoor Areas</span>
            <p className="text-stone-300">
              Guests who wish to smoke may do so exclusively in our clearly marked outdoor designated areas on the premises.
            </p>
          </div>
        </div>

        {/* Contact Support for Policy Questions */}
        <div className="bg-warm-200 p-8 rounded-sm text-center space-y-3 border border-stone-300">
          <h3 className="font-serif text-lg font-bold text-emerald-950">
            Have Questions About Hotel Guidelines?
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Our management team is on hand 24 hours a day to answer any questions or accommodate special requests.
          </p>
          <div className="pt-2">
            <a
              href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 hover:text-gold-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-gold-600" />
              <span>Call Front Desk: {HOTEL_DETAILS.phones[0]}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
