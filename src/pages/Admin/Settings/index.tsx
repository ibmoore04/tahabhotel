// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN SETTINGS
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Check, Hotel, Phone, MapPin, Mail, Clock, ShieldCheck } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '../../../services/api';
import { SiteSettings } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Skeleton } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSiteSettings(),
  });

  const [formData, setFormData] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<SiteSettings>) => updateSiteSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Hotel configuration updated successfully.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      saveMutation.mutate(formData);
    }
  };

  if (isLoading || !formData) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          Hotel Operational Settings
        </h1>
        <p className="text-xs text-stone-500">
          Manage general hotel details, phone lines, address, and operational hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2 border-b border-stone-200 pb-2">
            <Hotel className="w-4 h-4 text-gold-600" />
            General Information
          </h3>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-stone-700">
              Hotel Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-stone-700">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-stone-700">
              Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2 border-b border-stone-200 pb-2">
            <Phone className="w-4 h-4 text-gold-600" />
            Direct Contact Lines & Email
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Primary Phone
              </label>
              <input
                type="text"
                value={formData.phones[0] || ''}
                onChange={(e) => {
                  const newPhones = [...formData.phones];
                  newPhones[0] = e.target.value;
                  setFormData({ ...formData, phones: newPhones });
                }}
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Secondary Phone
              </label>
              <input
                type="text"
                value={formData.phones[1] || ''}
                onChange={(e) => {
                  const newPhones = [...formData.phones];
                  newPhones[1] = e.target.value;
                  setFormData({ ...formData, phones: newPhones });
                }}
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-stone-700">
              Inquiries & Reservations Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2 border-b border-stone-200 pb-2">
            <Clock className="w-4 h-4 text-gold-600" />
            Check-In & Operating Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Check-In Time
              </label>
              <input
                type="text"
                value={formData.check_in_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_time: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Check-Out Time
              </label>
              <input
                type="text"
                value={formData.check_out_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_time: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <Button
            type="submit"
            variant="gold"
            size="md"
            isLoading={saveMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
