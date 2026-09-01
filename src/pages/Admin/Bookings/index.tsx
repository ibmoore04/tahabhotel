// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN BOOKINGS MANAGEMENT
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  XCircle,
  Eye,
} from 'lucide-react';
import { getBookings, transitionBookingStatus } from '../../../services/api';
import type { Booking, BookingStatus } from '../../../types';
import { formatCurrency, formatDate, calculateNights } from '../../../utils/formatters';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

export const AdminBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      transitionBookingStatus(id, status, user?.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      showToast({
        type: 'success',
        title: 'Booking Status Updated',
        message: `Booking #${res.reference} marked as ${res.status}.`,
      });
      if (selectedBooking && selectedBooking.id === res.id) {
        setSelectedBooking({ ...selectedBooking, status: res.status });
      }
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update status.',
      });
    },
  });

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === 'all' ? true : b.status === statusFilter;
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
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Reservations & Bookings
        </h1>
        <p className="text-xs text-stone-500">
          Review, confirm, check-in, or manage guest stay reservations and special requests.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref #, guest name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Checked In', value: 'checked_in' },
            { label: 'Checked Out', value: 'checked_out' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-emerald-950 text-gold-400 font-bold border border-gold-500/50'
                  : 'bg-warm-50 text-stone-600 border border-stone-200 hover:text-emerald-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredBookings.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Reference / Guest</th>
                  <th className="p-4">Reserved Suite</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-warm-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-emerald-950 text-sm block">
                        {b.booking_reference}
                      </span>
                      <span className="font-semibold text-stone-800 block">
                        {b.guest_name}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {b.guest_phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-stone-900 block">
                        {b.room?.name || 'Hotel Room'}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {b.guest_count} {b.guest_count === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </td>
                    <td className="p-4 text-stone-700">
                      <span className="font-semibold">{formatDate(b.check_in)}</span>
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
                        className="text-stone-700 hover:text-emerald-950 p-1.5"
                        onClick={() => setSelectedBooking(b)}
                        title="View Full Booking Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {b.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="gold"
                          className="text-[10px] py-1 px-2.5"
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
                          className="text-[10px] py-1 px-2.5"
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
                          className="text-[10px] py-1 px-2.5 border border-stone-300"
                          onClick={() =>
                            statusMutation.mutate({ id: b.id, status: 'checked_out' })
                          }
                        >
                          Check Out
                        </Button>
                      )}

                      {['pending', 'confirmed'].includes(b.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[10px] py-1 px-2 text-rose-600 hover:text-rose-800"
                          onClick={() =>
                            statusMutation.mutate({ id: b.id, status: 'cancelled' })
                          }
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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
          title="No bookings match your criteria"
          description="Try modifying your search keywords or status filter."
        />
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Reservation Details — #${selectedBooking.booking_reference}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-sm text-stone-700">
            <div className="flex items-center justify-between bg-warm-50 p-4 rounded-sm border border-stone-200">
              <div>
                <span className="text-xs text-stone-500 uppercase font-semibold block">
                  Status
                </span>
                <StatusBadge status={selectedBooking.status} className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 uppercase font-semibold block">
                  Total Payable
                </span>
                <span className="font-serif text-xl font-bold text-emerald-950">
                  {formatCurrency(selectedBooking.total_price)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-b border-stone-200 pb-4">
              <h4 className="font-bold text-xs uppercase text-stone-500 tracking-wider">
                Guest Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Name:</span>
                  <span className="font-bold text-emerald-950 text-sm">
                    {selectedBooking.guest_name}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Phone:</span>
                  <a
                    href={`tel:${selectedBooking.guest_phone}`}
                    className="font-semibold text-emerald-950 hover:underline"
                  >
                    {selectedBooking.guest_phone}
                  </a>
                </div>
                <div>
                  <span className="text-stone-500 block">Email:</span>
                  <a
                    href={`mailto:${selectedBooking.guest_email}`}
                    className="font-semibold text-emerald-950 hover:underline"
                  >
                    {selectedBooking.guest_email}
                  </a>
                </div>
                <div>
                  <span className="text-stone-500 block">Guests Count:</span>
                  <span className="font-semibold text-stone-800">
                    {selectedBooking.guest_count} Person(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-b border-stone-200 pb-4">
              <h4 className="font-bold text-xs uppercase text-stone-500 tracking-wider">
                Stay Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Room / Suite:</span>
                  <span className="font-bold text-emerald-950 text-sm">
                    {selectedBooking.room?.name || 'Standard Room'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Duration:</span>
                  <span className="font-semibold text-stone-800">
                    {formatDate(selectedBooking.check_in)} → {formatDate(selectedBooking.check_out)} (
                    {calculateNights(selectedBooking.check_in, selectedBooking.check_out)} nights)
                  </span>
                </div>
              </div>
            </div>

            {selectedBooking.special_request && (
              <div className="space-y-1 bg-warm-50 p-3.5 rounded-sm border border-stone-200">
                <span className="text-xs font-bold uppercase text-stone-600 block">
                  Special Request From Guest:
                </span>
                <p className="text-xs text-stone-700 italic">
                  "{selectedBooking.special_request}"
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => {
                    statusMutation.mutate({
                      id: selectedBooking.id,
                      status: 'confirmed',
                    });
                  }}
                  disabled={selectedBooking.status === 'confirmed'}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={() => {
                    statusMutation.mutate({
                      id: selectedBooking.id,
                      status: 'checked_in',
                    });
                  }}
                  disabled={selectedBooking.status === 'checked_in'}
                >
                  Check In
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="border border-stone-300"
                  onClick={() => {
                    statusMutation.mutate({
                      id: selectedBooking.id,
                      status: 'checked_out',
                    });
                  }}
                  disabled={selectedBooking.status === 'checked_out'}
                >
                  Check Out
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
