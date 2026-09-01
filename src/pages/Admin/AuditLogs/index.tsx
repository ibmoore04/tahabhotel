// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AUDIT TRAIL LOGS
// Read-only immutable record of sensitive actions across the hotel system.
// ==============================================================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search, Filter, History } from 'lucide-react';
import { getAuditLogs } from '../../../services/auditService';
import { formatDate } from '../../../utils/formatters';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { SEO } from '../../../components/common/SEO';

export const AdminAuditLogsPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', actionFilter, entityFilter],
    queryFn: () =>
      getAuditLogs({
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
      }),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <SEO title="System Audit Logs | Admin Portal" />

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Security & Operational Audit Logs
        </h1>
        <p className="text-xs text-stone-500">
          Immutable, append-only chronological history of booking state changes, room updates, staff invitations, and administrative actions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by action (e.g. booking_status_changed, first_admin_provisioned)..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          >
            <option value="">All Entity Types</option>
            <option value="booking">Bookings</option>
            <option value="room">Rooms</option>
            <option value="staff">Staff</option>
            <option value="profile">Profiles</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : logs && logs.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200 font-sans">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-warm-50/50">
                    <td className="p-3.5 text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-stone-900 block font-sans">
                        {log.actor_email || 'System'}
                      </span>
                      {log.actor_role && (
                        <span className="text-[10px] uppercase text-gold-700 block font-sans">
                          {log.actor_role}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/10 text-emerald-900 font-bold border border-emerald-950/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-700">
                      {log.entity_type ? `${log.entity_type} / ${log.entity_id?.slice(0, 8)}...` : '—'}
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No audit logs recorded yet"
          description="Actions performed in the system (booking creation, check-ins, staff updates) will automatically record here."
        />
      )}
    </div>
  );
};
