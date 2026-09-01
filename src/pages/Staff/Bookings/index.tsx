// ==============================================================================
// TAHAB HOTEL & SUITES LTD — STAFF BOOKINGS & GUEST OPERATIONS
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { getBookings, transitionBookingStatus } from '../../../services/bookingService';
import type { Booking, BookingStatus } from '../../../types';
import { formatCurrency, formatDate, calculateNights } from '../../../utils/formatters';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SEO } from '../../../components/common/SEO';

export const StaffBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['staffBookings'],
    queryFn: () => getBookings(),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      transitionBookingStatus(id, status, user?.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Booking #${res.reference} updated to ${res.status}.`,
      });
      if (selectedBooking && selectedBooking.id === res.id) {
        setSelectedBooking({ ...selectedBooking, status: res.status });
      }
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Operation Failed',
        message: err?.message || 'Could not update booking status.',
      });
    },
  });

  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.booking_reference.toLowerCase().includes(q) ||
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_email.toLowerCase().includes(q) ||
        b.guest_phone.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl">
      <SEO title="Reservations & Operations | Staff Portal" />

      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Reservations & Operations
        </h1>
        <p className="text-xs text-stone-500">
          Manage guest check-ins, verify identity, process departures, and update reservation status.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference #, guest name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Checked In', value: 'checked_in' },
            { label: 'Checked Out', value: 'checked_out' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-emerald-950 text-gold-400 font-bold'
                  : 'bg-warm-50 text-stone-600 border border-stone-200 hover:text-emerald-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Reference / Guest</th>
                  <th className="p-4">Reserved Room</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Payable</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-warm-50/50">
                    <td className="p-4">
                      <span className="font-mono font-bold text-emerald-950 text-sm block">
                        #{b.booking_reference}
                      </span>
                      <span className="font-semibold text-stone-900 block">{b.guest_name}</span>
                      <span className="text-[11px] text-stone-500">{b.guest_phone}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-stone-900 block">{b.room?.name || 'Hotel Room'}</span>
                      <span className="text-[11px] text-stone-500">{b.guest_count} Guest(s)</span>
                    </td>
                    <td className="p-4 text-stone-700">
                      <span>{formatDate(b.check_in)}</span>
                      <span className="text-[11px] text-stone-500 block">
                        to {formatDate(b.check_out)} ({calculateNights(b.check_in, b.check_out)} nights)
                      </span>
                    </td>
                    <td className="p-4 font-serif font-bold text-emerald-950 text-sm">
                      {formatCurrency(b.total_price)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {b.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="gold"
                          className="text-[10px] py-1 px-2.5"
                          onClick={() =>
                            transitionMutation.mutate({ id: b.id, status: 'confirmed' })
                          }
                        >
                          Confirm
                        </Button>
                      )}

                      {b.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="emerald"
                          leftIcon={<LogIn className="w-3 h-3" />}
                          className="text-[10px] py-1 px-2.5"
                          onClick={() =>
                            transitionMutation.mutate({ id: b.id, status: 'checked_in' })
                          }
                        >
                          Check In
                        </Button>
                      )}

                      {b.status === 'checked_in' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<LogOut className="w-3 h-3" />}
                          className="text-[10px] py-1 px-2.5 border border-stone-300"
                          onClick={() =>
                            transitionMutation.mutate({ id: b.id, status: 'checked_out' })
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
        </div>
      ) : (
        <EmptyState
          title="No reservations found"
          description="Try modifying your search keywords or status filter."
        />
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details #${selectedBooking.booking_reference}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-center justify-between bg-warm-50 p-3 rounded-sm border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Status</span>
                <StatusBadge status={selectedBooking.status} className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total</span>
                <span className="font-serif text-base font-bold text-emerald-950">
                  {formatCurrency(selectedBooking.total_price)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 block uppercase text-[10px]">Guest Information</span>
              <p className="font-bold text-stone-900 text-sm">{selectedBooking.guest_name}</p>
              <p className="text-stone-600">Phone: {selectedBooking.guest_phone}</p>
              <p className="text-stone-600">Email: {selectedBooking.guest_email}</p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="text-stone-400 block uppercase text-[10px]">Stay Details</span>
              <p className="font-semibold text-stone-900">{selectedBooking.room?.name}</p>
              <p className="text-stone-600">
                {formatDate(selectedBooking.check_in)} → {formatDate(selectedBooking.check_out)}
              </p>
            </div>

            {selectedBooking.special_request && (
              <div className="bg-warm-50 p-2.5 rounded-sm border border-stone-200">
                <span className="font-bold block text-[10px] text-stone-600 uppercase">Special Request</span>
                <p className="italic text-stone-700">"{selectedBooking.special_request}"</p>
              </div>
            )}

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
