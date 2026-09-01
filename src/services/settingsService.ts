// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SETTINGS & CONTENT SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type {
  Amenity,
  GalleryItem,
  ContactMessage,
  SiteSettings,
  DashboardMetrics,
  MessageStatus,
} from '../types';
import { toSafeError } from '../types';

export async function getSiteSettings(): Promise<SiteSettings> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', 'hotel_info')
    .maybeSingle();

  if (error || !data?.value) {
    throw new Error('Site settings not configured. Run the database seed.');
  }

  return data.value as SiteSettings;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const sb = assertSupabaseConfigured();
  const current = await getSiteSettings();
  const merged = { ...current, ...updates };

  const { error } = await sb
    .from('site_settings')
    .upsert({
      key: 'hotel_info',
      value: merged,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(toSafeError(error));
  return merged;
}

export async function getAmenities(): Promise<Amenity[]> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('amenities')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(toSafeError(error));
  return (data ?? []) as Amenity[];
}

export async function getGallery(): Promise<GalleryItem[]> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(toSafeError(error));
  return (data ?? []) as GalleryItem[];
}

export async function sendContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'created_at'>
): Promise<ContactMessage> {
  const sb = assertSupabaseConfigured();

  const { data: inserted, error } = await sb
    .from('contact_messages')
    .insert([
      {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'unread',
      },
    ])
    .select()
    .single();

  if (error) throw new Error(toSafeError(error));
  return inserted as ContactMessage;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(toSafeError(error));
  return (data ?? []) as ContactMessage[];
}

export async function updateMessageStatus(id: string, status: MessageStatus): Promise<void> {
  const sb = assertSupabaseConfigured();

  const { error } = await sb
    .from('contact_messages')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(toSafeError(error));
}

/**
 * Call the get_dashboard_metrics RPC function for real operational numbers.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb.rpc('get_dashboard_metrics');

  if (error) throw new Error(toSafeError(error));
  return data as DashboardMetrics;
}
