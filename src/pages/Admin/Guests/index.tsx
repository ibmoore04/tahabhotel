// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN GUESTS DIRECTORY
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { getBookings } from '../../../services/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';

export const AdminGuestsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  });

  // Extract unique guests from bookings
  const guests = useMemo(() => {
    if (!bookings) return [];
    const guestMap = new Map<string, any>();

    bookings.forEach((b) => {
      const key = b.guest_email.toLowerCase();
      if (!guestMap.has(key)) {
        guestMap.set(key, {
          name: b.guest_name,
          email: b.guest_email,
          phone: b.guest_phone,
          totalBookings: 1,
          totalSpent: b.total_price || 0,
          lastCheckIn: b.check_in,
        });
      } else {
        const existing = guestMap.get(key);
        existing.totalBookings += 1;
        existing.totalSpent += b.total_price || 0;
        if (new Date(b.check_in) > new Date(existing.lastCheckIn)) {
          existing.lastCheckIn = b.check_in;
        }
      }
    });

    return Array.from(guestMap.values());
  }, [bookings]);

  const filteredGuests = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q)
    );
  }, [guests, search]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Guest Profiles & Directory
        </h1>
        <p className="text-xs text-stone-500">
          Directory of registered guests, repeat visitors, and their stay histories.
        </p>
      </div>

      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          />
        </div>
        <span className="text-xs text-stone-500 font-medium">
          {filteredGuests.length} Guests Recorded
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredGuests.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Total Reservations</th>
                  <th className="p-4">Total Value</th>
                  <th className="p-4">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((guest, idx) => (
                  <tr key={idx} className="hover:bg-warm-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-950 text-gold-400 font-bold flex items-center justify-center text-xs">
                          {guest.name.charAt(0)}
                        </div>
                        <span className="font-bold text-emerald-950 text-sm">
                          {guest.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-stone-800">
                      <a href={`tel:${guest.phone}`} className="hover:underline">
                        {guest.phone}
                      </a>
                    </td>
                    <td className="p-4 text-stone-600">
                      <a href={`mailto:${guest.email}`} className="hover:underline">
                        {guest.email}
                      </a>
                    </td>
                    <td className="p-4 font-semibold text-stone-800">
                      {guest.totalBookings} {guest.totalBookings === 1 ? 'Stay' : 'Stays'}
                    </td>
                    <td className="p-4 font-serif font-bold text-emerald-950 text-sm">
                      {formatCurrency(guest.totalSpent)}
                    </td>
                    <td className="p-4 text-stone-500">
                      {formatDate(guest.lastCheckIn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No guest records found"
          description="Guest profiles are automatically generated as reservations are made."
        />
      )}
    </div>
  );
};
