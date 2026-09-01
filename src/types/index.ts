// ==============================================================================
// TAHAB HOTEL & SUITES LTD — CORE TYPESCRIPT DEFINITIONS
// Production-grade types matching the database schema exactly.
// ==============================================================================

// ------------------------------------------------------------------------------
// USER & AUTH
// ------------------------------------------------------------------------------
export type UserRole = 'guest' | 'staff' | 'admin' | 'super_admin';

export type StaffPermission =
  | 'view_bookings'
  | 'create_booking'
  | 'update_booking'
  | 'cancel_booking'
  | 'check_in_guest'
  | 'check_out_guest'
  | 'view_guests'
  | 'manage_rooms'
  | 'manage_room_prices'
  | 'manage_room_images'
  | 'manage_amenities'
  | 'manage_gallery'
  | 'manage_staff'
  | 'manage_settings'
  | 'view_reports'
  | 'manage_content'
  | 'view_audit_logs';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  department?: string;
  position?: string;
  hired_at?: string;
  created_at: string;
  updated_at: string;
}

export type StaffMember = Profile & {
  permissions?: StaffPermission[];
};

// Permissions organized into display groups for the admin UI
export const PERMISSION_GROUPS: Record<string, StaffPermission[]> = {
  'Bookings': ['view_bookings', 'create_booking', 'update_booking', 'cancel_booking'],
  'Check-In / Out': ['check_in_guest', 'check_out_guest'],
  'Guest Management': ['view_guests'],
  'Room Management': ['manage_rooms', 'manage_room_prices', 'manage_room_images'],
  'Content': ['manage_amenities', 'manage_gallery', 'manage_content'],
  'Administration': ['manage_staff', 'manage_settings', 'view_reports', 'view_audit_logs'],
};

export const PERMISSION_LABELS: Record<StaffPermission, string> = {
  view_bookings: 'View Bookings',
  create_booking: 'Create Booking',
  update_booking: 'Update Booking Status',
  cancel_booking: 'Cancel Bookings',
  check_in_guest: 'Check In Guests',
  check_out_guest: 'Check Out Guests',
  view_guests: 'View Guest Profiles',
  manage_rooms: 'Manage Rooms',
  manage_room_prices: 'Manage Room Pricing',
  manage_room_images: 'Manage Room Images',
  manage_amenities: 'Manage Amenities',
  manage_gallery: 'Manage Gallery',
  manage_staff: 'Manage Staff',
  manage_settings: 'Manage Hotel Settings',
  view_reports: 'View Reports',
  manage_content: 'Manage Content',
  view_audit_logs: 'View Audit Logs',
};

// ------------------------------------------------------------------------------
// ROOMS
// ------------------------------------------------------------------------------
export type RoomCategory = 'standard' | 'executive' | 'presidential';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'inactive';

export interface RoomImage {
  id: string;
  room_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface RoomAmenity {
  id: string;
  room_id: string;
  amenity_name: string;
  created_at: string;
}

export interface Room {
  id: string;
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
  status: RoomStatus;
  is_listed: boolean;
  images: RoomImage[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface RoomFilters {
  category?: RoomCategory | 'all';
  capacity?: number;
  maxPrice?: number;
  status?: RoomStatus | 'all';
  search?: string;
}

// ------------------------------------------------------------------------------
// BOOKINGS
// ------------------------------------------------------------------------------
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'rejected';

// Valid state transitions (client-side UI guidance — DB enforces authoritatively)
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled', 'rejected'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
  rejected: [],
};

export interface Booking {
  id: string;
  booking_reference: string;
  user_id?: string;
  room_id: string;
  room?: Room;
  check_in: string;
  check_out: string;
  guest_count: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  status: BookingStatus;
  special_request?: string;
  // Price snapshot — immutable after booking creation
  price_per_night: number;
  num_nights: number;
  total_price: number;
  // Operational tracking
  checked_in_by?: string;
  checked_in_at?: string;
  checked_out_by?: string;
  checked_out_at?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

// Returned by create_booking_safe RPC
export interface BookingCreationResult {
  id: string;
  booking_reference: string;
  room_id: string;
  room_name: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  status: BookingStatus;
  price_per_night: number;
  num_nights: number;
  total_price: number;
  special_request?: string;
}

// ------------------------------------------------------------------------------
// AMENITIES
// ------------------------------------------------------------------------------
export type AmenityCategory = 'dining' | 'wellness' | 'business' | 'entertainment' | 'general';

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: AmenityCategory;
  image_url?: string;
  opening_hours?: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// CONTACT MESSAGES
// ------------------------------------------------------------------------------
export type MessageStatus = 'unread' | 'read' | 'archived' | 'replied';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  read_by?: string;
  read_at?: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// GALLERY
// ------------------------------------------------------------------------------
export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

// ------------------------------------------------------------------------------
// SITE SETTINGS
// ------------------------------------------------------------------------------
export interface SiteSettings {
  name: string;
  tagline: string;
  address: string;
  phones: string[];
  email: string;
  instagram: string;
  instagram_handle: string;
  facebook: string;
  facebook_handle: string;
  check_in_time: string;
  check_out_time: string;
  front_desk: string;
}

// ------------------------------------------------------------------------------
// AUDIT LOGS
// ------------------------------------------------------------------------------
export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------------------------
export type NotificationType =
  | 'new_booking'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'new_message'
  | 'staff_invitation'
  | 'check_in_reminder'
  | 'check_out_reminder';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ------------------------------------------------------------------------------
// STAFF PERMISSIONS
// ------------------------------------------------------------------------------
export interface StaffPermissionRecord {
  id: string;
  user_id: string;
  permission: StaffPermission;
  granted_by?: string;
  granted_at: string;
}

// ------------------------------------------------------------------------------
// DASHBOARD METRICS (from get_dashboard_metrics RPC)
// ------------------------------------------------------------------------------
export interface DashboardMetrics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  checked_in_today: number;
  arrivals_today: number;
  departures_today: number;
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  maintenance_rooms: number;
  total_revenue: number;
  monthly_revenue: number;
  unread_messages: number;
  total_guests: number;
  total_staff: number;
}

// ------------------------------------------------------------------------------
// API RESPONSE WRAPPERS
// ------------------------------------------------------------------------------
export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

// User-safe error messages (never expose database internals)
export function toSafeError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    // Parse our custom RPC error prefixes
    if (msg.includes('ROOM_CONFLICT:')) return 'This room is already booked for your selected dates. Please choose different dates.';
    if (msg.includes('ROOM_UNAVAILABLE:')) return 'The selected room is not currently available for booking.';
    if (msg.includes('INVALID_DATES:')) return 'Please check your check-in and check-out dates.';
    if (msg.includes('INVALID_GUESTS:')) return 'The guest count exceeds this room\'s capacity.';
    if (msg.includes('INVALID_TRANSITION:')) return 'This status change is not permitted at this stage.';
    if (msg.includes('BOOKING_NOT_FOUND:')) return 'Booking not found.';
    if (msg.includes('UNAUTHORIZED:')) return 'You do not have permission to perform this action.';
    if (msg.includes('UNAUTHENTICATED:')) return 'Please sign in to continue.';
    if (msg.includes('ALREADY_PROVISIONED:')) return 'An administrator already exists. Contact your system administrator.';
    if (msg.includes('INVALID_TOKEN:')) return 'The setup token is invalid or has expired.';
    if (msg.includes('PROFILE_NOT_FOUND:')) return 'User profile not found. Please complete registration first.';
    // Generic safe messages
    if (msg.includes('duplicate key')) return 'This record already exists.';
    if (msg.includes('violates foreign key')) return 'Related record not found.';
    if (msg.includes('permission denied') || msg.includes('row-level security')) return 'You do not have permission to perform this action.';
    if (msg.includes('JWT') || msg.includes('token')) return 'Your session has expired. Please sign in again.';
  }
  return 'An unexpected error occurred. Please try again.';
}
