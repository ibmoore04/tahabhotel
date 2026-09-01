// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN DASHBOARD
// Live database metrics & operations overview. Zero fabricated data.
// ==============================================================================

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  BedDouble,
  Clock,
  TrendingUp,
  Mail,
  ArrowRight,
  LogIn,
  LogOut,
  Users,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getBookings,
  getContactMessages,
  transitionBookingStatus,
} from '../../../services/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { isSuperAdmin } from '../../../utils/permissions';
import type { BookingStatus } from '../../../types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => getDashboardMetrics(),
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['recentBookings'],
    queryFn: () => getBookings({ pageSize: 6 }),
  });

  const { data: recentMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['recentMessages'],
    queryFn: () => getContactMessages(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      transitionBookingStatus(id, status, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['recentBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: 'The booking status was updated successfully.',
      });
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err?.message || 'Could not update status.',
      });
    },
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <SEO title="Executive Dashboard | Admin Portal" />

      {/* Welcome Banner */}
      <div className="bg-emerald-950 text-warm-50 p-6 sm:p-8 rounded-sm shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400 block font-sans">
            Executive Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold mt-1">
            Tahab Hotel Operations
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Live overview of reservations, room inventory, employee activity, and verified revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/staff">
            <Button variant="gold" size="sm">
              Manage Staff
            </Button>
          </Link>
          {isSuperAdmin(user?.role) && (
            <Link to="/admin/users">
              <Button variant="outline-white" size="sm">
                All Users
              </Button>
            </Link>
          )}
          <Link to="/admin/bookings">
            <Button variant="outline-white" size="sm">
              All Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Bookings */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 bg-emerald-50 text-emerald-900 rounded-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-950">
                {metrics?.total_bookings || 0}
              </span>
            )}
            <span className="text-xs text-stone-500 font-medium">All-time</span>
          </div>
        </div>

        {/* Metric 2: Pending Bookings */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-700">
                {metrics?.pending_bookings || 0}
              </span>
            )}
            <span className="text-xs text-amber-600 font-bold">Needs Review</span>
          </div>
        </div>

        {/* Metric 3: Available Suites */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Available Rooms</span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-sm">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-950">
                {metrics?.available_rooms || 0}
              </span>
            )}
            <span className="text-xs text-emerald-700 font-semibold">
              {metrics?.occupied_rooms || 0} Occupied
            </span>
          </div>
        </div>

        {/* Metric 4: Total Revenue */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Booked Revenue</span>
            <div className="p-2 bg-gold-100 text-gold-800 rounded-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            {metricsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="font-serif text-xl sm:text-2xl font-extrabold text-emerald-950 truncate">
                {formatCurrency(metrics?.total_revenue || 0)}
              </span>
            )}
            <span className="text-xs text-gold-700 font-bold">NGN</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Bookings - Desktop Table / Mobile Cards */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-warm-50/50">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-950">
                  Recent Guest Bookings
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500">Latest reservation inquiries and arrivals</p>
              </div>
              <Link
                to="/admin/bookings"
                className="text-[10px] sm:text-xs font-bold text-gold-700 hover:text-emerald-950 flex items-center gap-1 uppercase tracking-wider"
              >
                <span className="hidden sm:inline">View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {bookingsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : recentBookings && recentBookings.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-stone-100">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-emerald-950 block">
                            #{b.booking_reference}
                          </span>
                          <span className="text-stone-600 text-xs truncate block max-w-[200px]">
                            {b.guest_name}
                          </span>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="text-xs text-stone-600">
                        <span className="font-medium">{b.room?.name || 'Standard Room'}</span>
                        <span className="block text-[10px] text-stone-400 mt-1">
                          {formatDate(b.check_in)} → {formatDate(b.check_out)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <span className="font-bold text-emerald-950 text-sm">
                          {formatCurrency(b.total_price)}
                        </span>
                        <div>
                          {b.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="gold"
                              className="text-[10px] py-1.5 px-3 min-h-[36px]"
                              onClick={() =>
                                statusMutation.mutate({ id: b.id, status: 'confirmed' })
                              }
                            >
                              Confirm
                            </Button>
                          )}
                          {b.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="emerald"
                              className="text-[10px] py-1.5 px-3 min-h-[36px]"
                              onClick={() =>
                                statusMutation.mutate({ id: b.id, status: 'checked_in' })
                              }
                            >
                              Check In
                            </Button>
                          )}
                          {b.status === 'checked_in' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[10px] py-1.5 px-3 border border-stone-300 min-h-[36px]"
                              onClick={() =>
                                statusMutation.mutate({ id: b.id, status: 'checked_out' })
                              }
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="p-3.5">Ref / Guest</th>
                        <th className="p-3.5">Suite</th>
                        <th className="p-3.5">Dates</th>
                        <th className="p-3.5">Total</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-warm-50/60 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-emerald-950 block">
                              #{b.booking_reference}
                            </span>
                            <span className="text-stone-600 truncate block max-w-[140px]">
                              {b.guest_name}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-stone-800">
                            {b.room?.name || 'Standard Room'}
                          </td>
                          <td className="p-3.5 text-stone-600">
                            <span>{formatDate(b.check_in)}</span>
                            <span className="block text-[10px] text-stone-400">
                              to {formatDate(b.check_out)}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-950">
                            {formatCurrency(b.total_price)}
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            {b.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="gold"
                                className="text-[10px] py-1 px-2"
                                onClick={() =>
                                  statusMutation.mutate({ id: b.id, status: 'confirmed' })
                                }
                              >
                                Confirm
                              </Button>
                            )}
                            {b.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="emerald"
                                className="text-[10px] py-1 px-2"
                                onClick={() =>
                                  statusMutation.mutate({ id: b.id, status: 'checked_in' })
                                }
                              >
                                Check In
                              </Button>
                            )}
                            {b.status === 'checked_in' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[10px] py-1 px-2 border border-stone-300"
                                onClick={() =>
                                  statusMutation.mutate({ id: b.id, status: 'checked_out' })
                                }
                              >
                                Check Out
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500">
                No bookings in database yet. New reservations will appear here automatically.
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages Feed */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-warm-50/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  Guest Inquiries
                </h3>
                <p className="text-xs text-stone-500">Contact submissions & event requests</p>
              </div>
              <Link
                to="/admin/messages"
                className="text-xs font-bold text-gold-700 hover:text-emerald-950 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-stone-100 p-2">
              {messagesLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !recentMessages || recentMessages.length === 0 ? (
                <p className="p-6 text-xs text-stone-500 text-center">No messages received yet.</p>
              ) : (
                recentMessages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="p-3.5 space-y-1 hover:bg-warm-50 transition-colors rounded-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 truncate max-w-[180px]">
                        {msg.name}
                      </span>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-sm font-semibold ${
                        msg.status === 'unread'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-stone-700 truncate">
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
