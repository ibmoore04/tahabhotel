// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AUTHORIZATION UTILITIES
// ==============================================================================
// Centralized permission checks for the strict ADMIN vs SUPER_ADMIN hierarchy.
//
// IMPORTANT: Frontend checks are for UX only.
// Database RLS and SECURITY DEFINER RPC functions are the security boundary.
// ==============================================================================

import type { UserRole } from '../types';

export type Permission =
  | 'view_own_profile'
  | 'view_all_profiles'
  | 'update_own_profile'
  | 'update_other_profiles'
  | 'create_admin'
  | 'create_super_admin'
  | 'delete_audit_logs'
  | 'delete_rooms'
  | 'delete_bookings'
  | 'manage_rooms'
  | 'manage_gallery'
  | 'manage_amenities'
  | 'manage_site_settings'
  | 'view_audit_logs'
  | 'manage_staff_roles'
  | 'modify_super_admin'
  | 'promote_to_super_admin';

const SUPER_ADMIN_ONLY: Permission[] = [
  'create_super_admin',
  'delete_audit_logs',
  'delete_rooms',
  'delete_bookings',
  'modify_super_admin',
  'promote_to_super_admin',
];

const ADMIN_AND_SUPER_ADMIN: Permission[] = [
  'view_all_profiles',
  'update_other_profiles',
  'create_admin',
  'manage_rooms',
  'manage_gallery',
  'manage_amenities',
  'manage_site_settings',
  'view_audit_logs',
  'manage_staff_roles',
];

const STAFF_AND_HIGHER: Permission[] = [
  'view_own_profile',
  'update_own_profile',
];

export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;

  if (SUPER_ADMIN_ONLY.includes(permission)) {
    return role === 'super_admin';
  }

  if (ADMIN_AND_SUPER_ADMIN.includes(permission)) {
    return role === 'admin' || role === 'super_admin';
  }

  if (STAFF_AND_HIGHER.includes(permission)) {
    return ['staff', 'admin', 'super_admin'].includes(role);
  }

  return false;
}

export function canViewAdminDashboard(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canManageRooms(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canManageBookings(role: UserRole | undefined | null): boolean {
  return ['staff', 'admin', 'super_admin'].includes(role || '');
}

export function canManageStaff(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canManageAdmins(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function canDeleteAuditLogs(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function canManageSecurity(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function canCreateAdmin(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function canModifySuperAdmin(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function isAdminOnly(role: UserRole | undefined | null): boolean {
  return role === 'admin';
}

export function isSuperAdmin(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

export function isAdminOrSuperAdmin(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isStaffOrHigher(role: UserRole | undefined | null): boolean {
  return ['staff', 'admin', 'super_admin'].includes(role || '');
}

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Guest',
  staff: 'Staff',
  admin: 'Administrator',
  super_admin: 'Super Administrator',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  guest: 'bg-stone-100 text-stone-700 border-stone-300',
  staff: 'bg-blue-100 text-blue-900 border-blue-300',
  admin: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  super_admin: 'bg-purple-100 text-purple-900 border-purple-300',
};
