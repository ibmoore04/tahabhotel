// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN CONTACT MESSAGES
// ==============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Reply } from 'lucide-react';
import { getContactMessages, updateMessageStatus } from '../../../services/api';
import type { ContactMessage, MessageStatus } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { Button } from '../../../components/common/Button';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';

export const AdminMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => getContactMessages(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MessageStatus }) =>
      updateMessageStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      showToast({
        type: 'info',
        title: 'Status Updated',
        message: 'Message marked as processed.',
      });
      if (selectedMsg && selectedMsg.id === variables.id) {
        setSelectedMsg({ ...selectedMsg, status: variables.status });
      }
    },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Inquiries & Contact Inbox
        </h1>
        <p className="text-xs text-stone-500">
          Direct messages, rooftop party booking requests, and boardroom inquiries from the website.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : messages && messages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMsg(msg);
                  if (msg.status === 'unread') {
                    statusMutation.mutate({ id: msg.id, status: 'read' });
                  }
                }}
                className={`p-4 rounded-sm border cursor-pointer transition-all ${
                  selectedMsg?.id === msg.id
                    ? 'bg-emerald-950 text-warm-100 border-gold-500 shadow-md'
                    : msg.status === 'unread'
                    ? 'bg-white border-gold-500/60 shadow-sm font-semibold'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold truncate max-w-[180px]">
                    {msg.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm ${
                      msg.status === 'unread'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedMsg?.id === msg.id
                        ? 'bg-emerald-900 text-gold-400'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold truncate">{msg.subject}</h4>
                <p
                  className={`text-[11px] line-clamp-2 mt-1 ${
                    selectedMsg?.id === msg.id ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {msg.message}
                </p>
                <span
                  className={`text-[10px] block mt-2 ${
                    selectedMsg?.id === msg.id ? 'text-gold-400' : 'text-stone-400'
                  }`}
                >
                  {formatDate(msg.created_at)}
                </span>
              </div>
            ))}
          </div>

          {/* Message Detail Viewer */}
          <div className="lg:col-span-7">
            {selectedMsg ? (
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-sm space-y-6">
                <div className="border-b border-stone-200 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 block">
                      Message Details
                    </span>
                    <h3 className="font-serif text-xl font-bold text-emerald-950 mt-1">
                      {selectedMsg.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-stone-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(selectedMsg.created_at)}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-full bg-warm-100 border text-stone-700">
                    {selectedMsg.status}
                  </span>
                </div>

                {/* Sender card */}
                <div className="bg-warm-50 p-4 rounded-sm border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-500 block font-medium">Sender:</span>
                    <span className="font-bold text-emerald-950 text-sm">{selectedMsg.name}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-medium">Email Address:</span>
                    <a href={`mailto:${selectedMsg.email}`} className="font-semibold text-emerald-950 hover:underline">
                      {selectedMsg.email}
                    </a>
                  </div>
                  {selectedMsg.phone && (
                    <div>
                      <span className="text-stone-500 block font-medium">Phone Number:</span>
                      <a href={`tel:${selectedMsg.phone}`} className="font-semibold text-emerald-950 hover:underline">
                        {selectedMsg.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Message Content:
                  </span>
                  <div className="bg-stone-50 p-4 rounded-sm border border-stone-200 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(
                      selectedMsg.subject
                    )}`}
                  >
                    <Button variant="gold" size="sm" leftIcon={<Reply className="w-4 h-4" />}>
                      Reply via Email
                    </Button>
                  </a>

                  {selectedMsg.status !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({
                          id: selectedMsg.id,
                          status: 'archived',
                        })
                      }
                    >
                      Archive Message
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-sm border border-stone-200 text-center text-stone-500 text-xs">
                Select a message on the left to read full inquiry details.
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState title="No messages in inbox" />
      )}
    </div>
  );
};
