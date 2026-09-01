// ==============================================================================
// TAHAB HOTEL & SUITES LTD — PUBLIC LAYOUT WRAPPER
// ==============================================================================

import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { StickyMobileBookingBar } from '../components/layout/StickyMobileBookingBar';
import { NAV_LINKS, HOTEL_DETAILS } from '../constants';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Shield, User, Hotel, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isStaffOrAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-warm-100 text-charcoal-900 selection:bg-gold-500 selection:text-emerald-950">
      <AnnouncementBar />
      <Header mobileMenuOpen={mobileMenuOpen} onMobileMenuOpenChange={setMobileMenuOpen} />

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[65]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-emerald-950 border-t border-emerald-900 z-[70] flex flex-col overflow-y-auto"
        >
          <div className="p-4 sm:p-6 space-y-6 flex-1">
            <nav className="space-y-2" role="navigation" aria-label="Mobile navigation">
              <p className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold mb-4 block">Explore</p>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between py-3.5 px-4 rounded-sm transition-all duration-200 text-sm font-medium min-h-[48px]',
                      isActive
                        ? 'bg-emerald-900/60 text-gold-400 border-l-4 border-gold-400 font-bold'
                        : 'text-stone-200 hover:bg-emerald-900/40 hover:text-gold-300 border-l-4 border-transparent'
                    )
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className={cn('w-4 h-4 transition-transform', location.pathname === link.href && 'text-gold-400')} />
                </NavLink>
              ))}
            </nav>

            <div className="h-px bg-gradient-to-r from-emerald-900 via-emerald-800 to-transparent" />

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold mb-2">Actions</p>
              <Link to="/book" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="md" className="w-full justify-center font-bold shadow-gold-md min-h-[48px]">
                  <Calendar className="w-4 h-4" />
                  Book Your Stay Now
                </Button>
              </Link>

              {user ? (
                <>
                  <Link to={isAdmin ? '/admin' : isStaffOrAdmin ? '/staff' : '/account'} className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline-gold" size="md" className="w-full justify-center font-semibold min-h-[48px]">
                      {isAdmin ? (
                        <>
                          <Shield className="w-4 h-4" />
                          Admin Portal
                        </>
                      ) : isStaffOrAdmin ? (
                        <>
                          <Hotel className="w-4 h-4" />
                          Staff Portal
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          My Account
                        </>
                      )}
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => { await signOut(); setMobileMenuOpen(false); }}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-emerald-700/80 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-200 transition-colors hover:border-rose-400 hover:bg-rose-950/40 hover:text-rose-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline-white" size="md" className="w-full justify-center font-semibold min-h-[48px]">
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-emerald-900/80 bg-emerald-950/50 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">Contact Us</p>
              <p className="text-xs sm:text-sm text-stone-200 font-medium">{HOTEL_DETAILS.address}</p>
            </div>
            <div className="pt-2 border-t border-emerald-900/60">
              <a href={`tel:${HOTEL_DETAILS.phones[0].replace(/\s/g, '')}`} className="text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-2">
                <span>Call Front Desk</span>
                <span className="text-gold-300">→</span>
              </a>
              <p className="text-xs text-stone-400 mt-1">{HOTEL_DETAILS.phones[0]}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 mobile-safe-bottom md:pb-0">
        <Outlet />
      </main>

      <Footer />
      <StickyMobileBookingBar />
    </div>
  );
};
