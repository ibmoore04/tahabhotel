// ==============================================================================
// TAHAB HOTEL & SUITES LTD — MAIN NAVIGATION HEADER
// Fully optimized for mobile with premium hamburger menu
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, Crown, Shield, User, Hotel, ChevronRight, LogOut } from 'lucide-react';
import { NAV_LINKS, HOTEL_DETAILS } from '../../constants';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

export const Header: React.FC<{
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
}> = ({ mobileMenuOpen = false, onMobileMenuOpenChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isStaffOrAdmin, signOut } = useAuth();

  const setMobileMenuOpen = (open: boolean) => {
    onMobileMenuOpenChange?.(open);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] h-16 w-full bg-emerald-950 border-b border-emerald-800/80'
      )}
    >
      <div className="mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group select-none shrink-0">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-sm bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-emerald-950 shadow-gold-sm group-hover:scale-105 transition-transform">
            <Crown className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="block">
            <span className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-wider text-warm-50 block leading-tight group-hover:text-gold-400 transition-colors">
              TAHAB LTD
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-gold-400 font-sans block">
              Hotel & Suites
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'text-xs tracking-widest uppercase font-medium transition-all duration-200 py-1 border-b-2',
                  isActive
                    ? 'text-gold-400 border-gold-400 font-semibold'
                    : 'text-stone-300 border-transparent hover:text-gold-300 hover:border-gold-500/50'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link to="/admin">
                  <Button variant="outline-gold" size="sm" leftIcon={<Shield className="w-3.5 h-3.5" />}>
                    Admin Portal
                  </Button>
                </Link>
              ) : isStaffOrAdmin ? (
                <Link to="/staff">
                  <Button variant="outline-gold" size="sm" leftIcon={<Hotel className="w-3.5 h-3.5" />}>
                    Staff Portal
                  </Button>
                </Link>
              ) : (
                <Link to="/account">
                  <span className="text-xs text-warm-100 flex items-center gap-1.5 bg-emerald-900/80 px-3 py-1.5 rounded-sm border border-emerald-700/60 hover:border-gold-500 transition-colors">
                    <User className="w-3.5 h-3.5 text-gold-400" />
                    My Account
                  </span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs tracking-wider uppercase text-stone-300 hover:text-gold-400 transition-colors font-semibold px-2 py-1"
            >
              Sign In
            </Link>
          )}

          <Link to="/book">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
              className="shadow-gold-sm"
            >
              Book A Room
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Link
            to="/book"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-gold-500/70 bg-gold-500/10 text-gold-400 transition-colors hover:bg-gold-500 hover:text-emerald-950"
            aria-label="Book a room"
            title="Book a room"
          >
            <Calendar className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-warm-100 transition-colors hover:bg-emerald-900 hover:text-gold-400 active:scale-95"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        </div>
      </header>
    );
  };

export default Header;
