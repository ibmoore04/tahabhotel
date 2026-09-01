// ==============================================================================
// TAHAB HOTEL & SUITES LTD — STAFF PORTAL LAYOUT
// ==============================================================================

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Hotel,
  Calendar,
  UserCheck,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { useRealtimeOperations } from '../hooks/useRealtimeBookings';
import { cn } from '../utils/cn';

export const StaffLayout: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Activate realtime notifications
  useRealtimeOperations();

  const navigation = [
    { name: 'Operations Overview', href: '/staff', icon: Hotel },
    { name: 'Reservations & Guests', href: '/staff/bookings', icon: Calendar },
    { name: 'Fast Check-In', href: '/staff/check-in', icon: UserCheck },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-warm-100 flex font-sans text-stone-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-emerald-950 text-warm-50 p-4 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-30">
        <Link to="/staff" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-emerald-950 font-serif font-bold">
            T
          </div>
          <div>
            <span className="font-serif font-bold text-sm block leading-tight">TAHAB HOTEL</span>
            <span className="text-[9px] uppercase tracking-wider text-gold-400 block">Staff Portal</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-stone-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-emerald-950 text-warm-100 flex-shrink-0 flex flex-col justify-between border-r border-emerald-900/60 transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Logo */}
            <Link to="/" className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-emerald-950 shadow-gold-sm">
                <Crown className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-serif text-base font-bold text-warm-50 block leading-tight">
                  TAHAB HOTEL
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-gold-400 font-sans block">
                  Staff Operations
                </span>
              </div>
            </Link>

            {/* User badge */}
            <div className="bg-emerald-900/60 p-3 rounded-sm border border-emerald-800 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Logged in as:</span>
              <p className="text-xs font-bold text-warm-50 truncate">{user?.fullName}</p>
              <span className="text-[10px] text-gold-400 block uppercase">
                {user?.department || user?.role}
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-medium transition-all',
                      active
                        ? 'bg-gold-500 text-emerald-950 font-bold shadow-sm'
                        : 'text-stone-300 hover:bg-emerald-900/80 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-emerald-900/80 space-y-2 mt-auto">
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="outline-white"
                  size="sm"
                  className="w-full text-xs justify-center py-2"
                >
                  Go to Admin Portal
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="w-full text-xs text-stone-300 hover:text-rose-400 justify-center"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-emerald-950 text-warm-50 p-4 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-30">
        <Link to="/staff" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-emerald-950 font-serif font-bold">
            T
          </div>
          <div>
            <span className="font-serif font-bold text-sm block leading-tight">TAHAB HOTEL</span>
            <span className="text-[9px] uppercase tracking-wider text-gold-400 block">Staff Portal</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-stone-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};
