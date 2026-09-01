// ==============================================================================
// TAHAB HOTEL & SUITES LTD — 404 NOT FOUND PAGE
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Home, Compass } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SEO } from '../../components/common/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-warm-100 px-4 py-16 text-center">
      <SEO title="Page Not Found (404)" />

      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-950 text-gold-400 border border-gold-500/50 flex items-center justify-center mx-auto shadow-gold-sm">
          <Crown className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-4xl font-extrabold text-gold-600 block">
            404
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
            We couldn't find that page.
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="gold-divider mx-auto" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="gold"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Return Home
            </Button>
          </Link>
          <Link to="/rooms" className="w-full sm:w-auto">
            <Button
              variant="outline-gold"
              size="md"
              leftIcon={<Compass className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Explore Rooms
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
