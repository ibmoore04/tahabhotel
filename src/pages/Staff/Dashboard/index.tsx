// ==============================================================================
// TAHAB HOTEL & SUITES LTD — STAFF OPERATIONS DASHBOARD
// Real operational metrics only — zero fabricated data.
// ==============================================================================

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Users,
  Hotel,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getBookings } from '../../../services/bookingService';
import { getDashboardMetrics } from '../../../services/settingsService';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { formatDate } from '../../../utils/formatters';
import { SEO } from '../../../components/common/SEO';

export const StaffDashboardPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => getDashboardMetrics(),
  });

  const { data: arrivals, isLoading: arrivalsLoading } = useQuery({
    queryKey: ['staffArrivalsToday', todayStr],
    queryFn: () => getBookings({ checkIn: todayStr, status: 'confirmed' }),
  });

  const { data: departures, isLoading: departuresLoading } = useQuery({
    queryKey: ['staffDeparturesToday', todayStr],
    queryFn: () => getBookings({ checkOut: todayStr, status: 'checked_in' }),
  });

  const { data: activeGuests, isLoading: activeLoading } = useQuery({
    queryKey: ['staffActiveGuests'],
    queryFn: () => getBookings({ status: 'checked_in' }),
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <SEO title="Staff Operations Overview" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-gold-700 block">
            Front Desk & Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            Daily Operations Overview
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Today's arrivals, departures, room occupancy, and live check-in management.
          </p>
        </div>

        <Link to="/staff/check-in">
          <Button variant="gold" size="md" leftIcon={<LogIn className="w-4 h-4" />}>
            Fast Guest Check-In
          </Button>
        </Link>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs uppercase font-bold">Today's Arrivals</span>
            <LogIn className="w-4 h-4 text-emerald-800" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="font-serif text-2xl font-bold text-emerald-950 block">
              {metrics?.arrivals_today || 0}
            </span>
          )}
          <span className="text-[11px] text-stone-400 block">Expected check-ins today</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs uppercase font-bold">Today's Departures</span>
            <LogOut className="w-4 h-4 text-amber-700" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="font-serif text-2xl font-bold text-emerald-950 block">
              {metrics?.departures_today || 0}
            </span>
          )}
          <span className="text-[11px] text-stone-400 block">Expected check-outs today</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs uppercase font-bold">Currently Checked-In</span>
            <Users className="w-4 h-4 text-gold-600" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="font-serif text-2xl font-bold text-emerald-950 block">
              {metrics?.occupied_rooms || 0}
            </span>
          )}
          <span className="text-[11px] text-stone-400 block">Active in-house rooms</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs uppercase font-bold">Pending Bookings</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="font-serif text-2xl font-bold text-emerald-950 block">
              {metrics?.pending_bookings || 0}
            </span>
          )}
          <span className="text-[11px] text-stone-400 block">Awaiting confirmation</span>
        </div>
      </div>

      {/* Grid: Arrivals vs Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expected Arrivals */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-900" />
              <h2 className="font-serif text-lg font-bold text-emerald-950">
                Today's Expected Arrivals
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-stone-500">
              {arrivals?.length || 0} Guest(s)
            </span>
          </div>

          {arrivalsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : arrivals && arrivals.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {arrivals.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-950 block">
                      #{b.booking_reference}
                    </span>
                    <span className="font-semibold text-stone-900 block">{b.guest_name}</span>
                    <span className="text-[11px] text-stone-500">{b.room?.name}</span>
                  </div>
                  <Link to={`/staff/check-in?ref=${b.booking_reference}`}>
                    <Button variant="emerald" size="sm" className="text-[10px] py-1 px-2.5">
                      Process Check-In
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-stone-500">
              No arrivals scheduled for today.
            </div>
          )}
        </div>

        {/* Expected Departures */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-amber-800" />
              <h2 className="font-serif text-lg font-bold text-emerald-950">
                Today's Expected Departures
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-stone-500">
              {departures?.length || 0} Guest(s)
            </span>
          </div>

          {departuresLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : departures && departures.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {departures.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-950 block">
                      #{b.booking_reference}
                    </span>
                    <span className="font-semibold text-stone-900 block">{b.guest_name}</span>
                    <span className="text-[11px] text-stone-500">{b.room?.name}</span>
                  </div>
                  <Link to="/staff/bookings">
                    <Button variant="ghost" size="sm" className="text-[10px] py-1 px-2.5 border border-stone-300">
                      Check Out
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-stone-500">
              No departures scheduled for today.
            </div>
          )}
        </div>
      </div>

      {/* Currently In-House Guests - Mobile Cards / Desktop Table */}
      <div className="bg-white p-4 sm:p-6 rounded-sm border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base sm:text-lg font-bold text-emerald-950">
            Currently In-House Guests
          </h2>
          <Link to="/staff/bookings" className="text-[10px] sm:text-xs font-semibold text-gold-700 hover:underline">
            View All ↗
          </Link>
        </div>

        {activeLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : activeGuests && activeGuests.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-stone-100">
              {activeGuests.map((b) => (
                <div key={b.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-950 block text-sm">
                        #{b.booking_reference}
                      </span>
                      <span className="font-semibold text-stone-900 block text-xs">{b.guest_name}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <span className="font-medium text-stone-700">{b.room?.name}</span>
                    <span className="block mt-0.5">
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </span>
                  </div>
                  {b.special_request && (
                    <p className="text-[10px] text-stone-500 italic bg-warm-50 p-2 rounded-sm">
                      "{b.special_request}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3">Reference / Guest</th>
                    <th className="p-3">Suite</th>
                    <th className="p-3">Stay Dates</th>
                    <th className="p-3">Special Requests</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeGuests.map((b) => (
                    <tr key={b.id} className="hover:bg-warm-50/50">
                      <td className="p-3">
                        <span className="font-mono font-bold text-emerald-950 block">
                          #{b.booking_reference}
                        </span>
                        <span className="font-semibold text-stone-900 block">{b.guest_name}</span>
                        <span className="text-[11px] text-stone-500">{b.guest_phone}</span>
                      </td>
                      <td className="p-3 font-semibold text-stone-800">{b.room?.name}</td>
                      <td className="p-3 text-stone-600">
                        {formatDate(b.check_in)} → {formatDate(b.check_out)}
                      </td>
                      <td className="p-3 text-stone-600 italic">
                        {b.special_request || 'None'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-stone-500">
            No guests currently checked in.
          </div>
        )}
      </div>
    </div>
  );
};
