// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOM SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type { Room, RoomFilters, RoomCategory, RoomStatus } from '../types';
import { toSafeError } from '../types';

export async function getRooms(filters?: RoomFilters): Promise<Room[]> {
  const sb = assertSupabaseConfigured();

  let query = sb
    .from('rooms')
    .select(`
      *,
      room_images (*),
      room_amenities (*)
    `)
    .order('price_per_night', { ascending: true });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.capacity) {
    query = query.gte('capacity', filters.capacity);
  }
  if (filters?.maxPrice) {
    query = query.lte('price_per_night', filters.maxPrice);
  }
  if (filters?.search) {
    const q = filters.search.trim();
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,tagline.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(toSafeError(error));

  return (data ?? []).map((r: any) => ({
    ...r,
    images: (r.room_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    amenities: (r.room_amenities || []).map((a: any) => a.amenity_name),
  }));
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('rooms')
    .select(`
      *,
      room_images (*),
      room_amenities (*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(toSafeError(error));
  if (!data) return null;

  return {
    ...data,
    images: (data.room_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    amenities: (data.room_amenities || []).map((a: any) => a.amenity_name),
  };
}

export async function getRoomById(id: string): Promise<Room | null> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('rooms')
    .select(`
      *,
      room_images (*),
      room_amenities (*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(toSafeError(error));
  if (!data) return null;

  return {
    ...data,
    images: (data.room_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    amenities: (data.room_amenities || []).map((a: any) => a.amenity_name),
  };
}

export interface CreateRoomInput {
  name: string;
  slug: string;
  category: RoomCategory;
  description: string;
  tagline?: string;
  price_per_night: number;
  capacity: number;
  bed_type: string;
  floor: number;
  size_sqm?: number;
  status?: RoomStatus;
  is_listed?: boolean;
  amenities?: string[];
  image_urls?: string[];
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const sb = assertSupabaseConfigured();

  const { data: room, error: roomError } = await sb
    .from('rooms')
    .insert([
      {
        name: input.name,
        slug: input.slug,
        category: input.category,
        description: input.description,
        tagline: input.tagline || null,
        price_per_night: input.price_per_night,
        capacity: input.capacity,
        bed_type: input.bed_type,
        floor: input.floor,
        size_sqm: input.size_sqm || null,
        status: input.status || 'available',
        is_listed: input.is_listed !== false,
      },
    ])
    .select()
    .single();

  if (roomError) throw new Error(toSafeError(roomError));

  // Add amenities if provided
  if (input.amenities && input.amenities.length > 0) {
    const amenityRows = input.amenities.map((amenity_name) => ({
      room_id: room.id,
      amenity_name,
    }));
    await sb.from('room_amenities').insert(amenityRows);
  }

  // Add images if provided
  if (input.image_urls && input.image_urls.length > 0) {
    const imageRows = input.image_urls.map((image_url, idx) => ({
      room_id: room.id,
      image_url,
      is_primary: idx === 0,
      sort_order: idx + 1,
    }));
    await sb.from('room_images').insert(imageRows);
  }

  return (await getRoomById(room.id)) as Room;
}

export async function updateRoom(
  id: string,
  updates: Partial<Omit<Room, 'id' | 'images' | 'amenities' | 'created_at' | 'updated_at'>>,
  amenities?: string[]
): Promise<Room> {
  const sb = assertSupabaseConfigured();

  const { error } = await sb
    .from('rooms')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(toSafeError(error));

  if (amenities !== undefined) {
    // Replace amenities
    await sb.from('room_amenities').delete().eq('room_id', id);
    if (amenities.length > 0) {
      await sb.from('room_amenities').insert(
        amenities.map((amenity_name) => ({ room_id: id, amenity_name }))
      );
    }
  }

  return (await getRoomById(id)) as Room;
}

export async function setRoomStatus(id: string, status: RoomStatus): Promise<void> {
  const sb = assertSupabaseConfigured();
  const { error } = await sb.from('rooms').update({ status }).eq('id', id);
  if (error) throw new Error(toSafeError(error));
}
