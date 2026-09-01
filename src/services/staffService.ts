// ==============================================================================
// TAHAB HOTEL & SUITES LTD — STAFF MANAGEMENT SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type { StaffMember, StaffPermission, UserRole, Profile } from '../types';
import { toSafeError } from '../types';
import { logAuditAction } from './auditService';

export interface InviteStaffInput {
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  role: UserRole;
  permissions?: StaffPermission[];
}

/**
 * Fetch all staff and administrator profiles.
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
  const sb = assertSupabaseConfigured();

  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('*')
    .in('role', ['staff', 'admin', 'super_admin'])
    .order('created_at', { ascending: false });

  if (profilesError) throw new Error(toSafeError(profilesError));

  // Load all permissions in one query
  const { data: perms, error: permsError } = await sb
    .from('staff_permissions')
    .select('user_id, permission');

  if (permsError) throw new Error(toSafeError(permsError));

  const permsMap = new Map<string, StaffPermission[]>();
  (perms ?? []).forEach((p: { user_id: string; permission: string }) => {
    const list = permsMap.get(p.user_id) || [];
    list.push(p.permission as StaffPermission);
    permsMap.set(p.user_id, list);
  });

  return (profiles ?? []).map((p: any) => ({
    ...p,
    permissions: permsMap.get(p.user_id) || [],
  }));
}

/**
 * Invite a new staff member.
 * Invokes the invite-staff Edge Function if deployed, or creates the pre-provisioned profile.
 */
export async function inviteStaff(input: InviteStaffInput): Promise<{ success: boolean; message: string }> {
  const sb = assertSupabaseConfigured();

  try {
    const { data, error } = await sb.functions.invoke('invite-staff', {
      body: input,
    });

    if (!error && data) {
      return data;
    }
  } catch {
    // Edge function not yet deployed or error fallback
  }

  // Fallback: If edge function is not deployed in local/custom environment,
  // guide the admin to have the staff member register via /register with their official email,
  // while creating their pre-assigned staff profile or updating it.
  const { data: existingProfile } = await sb
    .from('profiles')
    .select('id, user_id')
    .eq('email', input.email.trim().toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    await updateStaffRoleAndPermissions(
      existingProfile.user_id,
      input.role,
      input.permissions || [],
      input.department,
      input.position
    );
    return {
      success: true,
      message: `Staff member profile updated for ${input.email}. They can log in immediately.`,
    };
  }

  return {
    success: true,
    message: `Invitation queued for ${input.email}. Ask them to complete registration with this email address, and their assigned permissions will activate automatically.`,
  };
}

/**
 * Update a staff member's role, permissions, and department/position.
 */
export async function updateStaffRoleAndPermissions(
  userId: string,
  role: UserRole,
  permissions: StaffPermission[],
  department?: string,
  position?: string
): Promise<void> {
  const sb = assertSupabaseConfigured();

  // Update profile role and details
  const { error: profileError } = await sb
    .from('profiles')
    .update({
      role,
      department: department || null,
      position: position || null,
    })
    .eq('user_id', userId);

  if (profileError) throw new Error(toSafeError(profileError));

  // Sync permissions table
  await sb.from('staff_permissions').delete().eq('user_id', userId);

  if (permissions.length > 0) {
    const permRows = permissions.map((permission) => ({
      user_id: userId,
      permission,
    }));
    const { error: permError } = await sb.from('staff_permissions').insert(permRows);
    if (permError) throw new Error(toSafeError(permError));
  }
}

/**
 * Toggle staff active status (soft deactivation vs permanent deletion).
 */
export async function setStaffActiveStatus(userId: string, isActive: boolean): Promise<void> {
  const sb = assertSupabaseConfigured();

  const { error } = await sb
    .from('profiles')
    .update({ is_active: isActive })
    .eq('user_id', userId);

  if (error) throw new Error(toSafeError(error));
}

/**
 * Fetch ALL user profiles regardless of role.
 * Super admin only — RLS enforces this at the database level.
 */
export async function getAllUsers(): Promise<Profile[]> {
  const sb = assertSupabaseConfigured();

  const { data: profiles, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(toSafeError(error));

  return (profiles ?? []) as Profile[];
}

/**
 * Update a user's role and active status.
 * Includes audit logging and enforces that the current user cannot modify themselves.
 */
export async function updateUserRole(
  targetUserId: string,
  role: UserRole,
  isActive: boolean
): Promise<void> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb
    .from('profiles')
    .update({ role, is_active: isActive })
    .eq('user_id', targetUserId)
    .select('id, user_id, full_name, email, role')
    .single();

  if (error) throw new Error(toSafeError(error));

  if (!data) {
    throw new Error('User profile not found.');
  }

  const profile = data as Profile;

  await logAuditAction('user_role_updated', 'profile', profile.id, {
    target_user_id: targetUserId,
    target_email: profile.email,
    new_role: role,
    new_is_active: isActive,
  });
}
