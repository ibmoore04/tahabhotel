// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN MANAGEMENT LAYOUT
// ==============================================================================

import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  Sparkles,
  Image,
  Mail,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  ExternalLink,
  Shield,
  UserCog,
  History,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeOperations } from '../hooks/useRealtimeBookings';
import { cn } from '../utils/cn';
import { isSuperAdmin } from '../utils/permissions';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showSuperAdminItems = isSuperAdmin(user?.role);

  // Activate realtime notifications
  useRealtimeOperations();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck2 },
    { label: 'Rooms & Suites', href: '/admin/rooms', icon: BedDouble },
    { label: 'Staff Management', href: '/admin/staff', icon: UserCog },
    ...(showSuperAdminItems ? [{ label: 'All Users', href: '/admin/users', icon: UsersRound }] : []),
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
    { label: 'Guests', href: '/admin/guests', icon: Users },
    { label: 'Amenities', href: '/admin/amenities', icon: Sparkles },
    { label: 'Gallery', href: '/admin/gallery', icon: Image },
    { label: 'Messages', href: '/admin/messages', icon: Mail },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-charcoal-900">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-950 text-warm-50 p-4 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-gold-400" />
          <span className="font-serif font-bold text-sm">Tahab Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-stone-300 hover:text-warm-50"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-warm-100 flex flex-col justify-between border-r border-emerald-900 transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Header */}
          <div className="p-6 border-b border-emerald-900 shrink-0">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-gold-500 flex items-center justify-center text-emerald-950 font-bold shadow-gold-sm">
                <Crown className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif text-base font-bold text-warm-50 block leading-tight">
                  TAHAB HOTEL
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold-400 block font-sans">
                  Management Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all',
                    isActive
                      ? 'bg-gold-500 text-emerald-950 shadow-gold-sm font-bold'
                      : 'text-stone-300 hover:bg-emerald-900/60 hover:text-gold-300'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom user profile & view site */}
          <div className="p-4 border-t border-emerald-900 bg-emerald-950/80 space-y-3 shrink-0">
            <div className="flex flex-col gap-1.5">
              <Link
                to="/staff"
                className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-gold-400 bg-emerald-900/40 rounded-sm border border-emerald-800 transition-colors"
              >
                <span>Staff Operations Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-gold-400 bg-emerald-900/40 rounded-sm border border-emerald-800 transition-colors"
              >
                <span>View Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center text-gold-400 shrink-0 border border-gold-500/30 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-warm-100 truncate">
                    {user?.fullName || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-gold-400 uppercase tracking-widest truncate">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Main Admin Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden md:ml-64">
        {/* Top Navbar */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 hidden md:flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">
              Tahab Hotel & Suites Ltd
            </span>
            <h2 className="font-serif text-lg font-bold text-emerald-950 capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Executive Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System Active
            </span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
