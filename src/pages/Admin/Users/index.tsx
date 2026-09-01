// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SUPER ADMIN USER MANAGEMENT
// View and manage all users across all roles (guest, staff, admin, super_admin)
// ==============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import {
  Users,
  Search,
  Shield,
  UserCog,
  Edit3,
  CheckCircle2,
  XCircle,
  Crown,
  User,
} from 'lucide-react';
import {
  getAllUsers,
  setStaffActiveStatus,
} from '../../../services/staffService';
import type { Profile, UserRole } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Modal, ConfirmDialog } from '../../../components/common/Modal';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { isSuperAdmin } from '../../../utils/permissions';
import { assertSupabaseConfigured } from '../../../lib/supabase';

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  if (!isSuperAdmin(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('guest');
  const [editIsActive, setEditIsActive] = useState(true);
  const [deactivatingUser, setDeactivatingUser] = useState<Profile | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => getAllUsers(),
  });

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) throw new Error('No user selected');
      const sb = assertSupabaseConfigured();
      const { data, error } = await sb.rpc('update_user_role_super_admin', {
        p_target_user_id: editingUser.user_id,
        p_new_role: editRole,
        p_new_is_active: editIsActive,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      showToast({
        type: 'success',
        title: 'User Updated',
        message: 'Role and status have been saved.',
      });
      setEditingUser(null);
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update user.',
      });
    },
  });

  const activeToggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setStaffActiveStatus(userId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `User has been ${variables.isActive ? 'activated' : 'deactivated'}.`,
      });
      setDeactivatingUser(null);
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.message || 'Could not update status.',
      });
    },
  });

  const openEditModal = (user: Profile) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditIsActive(user.is_active);
  };

  const filteredUsers = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: users?.length ?? 0,
    guest: users?.filter((u) => u.role === 'guest').length ?? 0,
    staff: users?.filter((u) => u.role === 'staff').length ?? 0,
    admin: users?.filter((u) => u.role === 'admin').length ?? 0,
    super_admin: users?.filter((u) => u.role === 'super_admin').length ?? 0,
  };

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      super_admin: 'bg-purple-100 text-purple-900 border-purple-300',
      admin: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      staff: 'bg-blue-100 text-blue-900 border-blue-300',
      guest: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          configs[role]
        }`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <SEO title="User Management | Super Admin Portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-950">
            All Users
          </h1>
          <p className="text-xs text-stone-500">
            Manage roles and access for every account on the platform.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm text-stone-900 font-medium"
          >
            <option value="all">All Roles ({roleCounts.all})</option>
            <option value="guest">Guests ({roleCounts.guest})</option>
            <option value="staff">Staff ({roleCounts.staff})</option>
            <option value="admin">Admins ({roleCounts.admin})</option>
            <option value="super_admin">Super Admins ({roleCounts.super_admin})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-warm-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-950 text-gold-400 font-bold flex items-center justify-center text-xs">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{u.full_name}</span>
                          <span className="text-[11px] text-stone-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(u.role)}</td>
                    <td className="p-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-stone-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {u.role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-stone-700 hover:text-emerald-950"
                          title="Edit Role & Status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {u.user_id !== user?.id && u.role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (u.is_active) {
                              setDeactivatingUser(u);
                            } else {
                              activeToggleMutation.mutate({
                                userId: u.user_id,
                                isActive: true,
                              });
                            }
                          }}
                          className={`text-[10px] py-1 px-2.5 ${
                            u.is_active
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
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
          title="No users match criteria"
          description="Try adjusting your search or filters."
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.full_name}`}
          maxWidth="md"
        >
          <div className="space-y-5 text-xs text-stone-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm font-bold text-sm text-stone-900"
                >
                  <option value="guest">Guest</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Super Admin role cannot be assigned through this interface.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Account Status
                </label>
                <select
                  value={editIsActive ? 'true' : 'false'}
                  onChange={(e) => setEditIsActive(e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm text-sm text-stone-900"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Inactive users cannot sign in.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                variant="emerald"
                size="md"
                isLoading={saveRoleMutation.isPending}
                onClick={() => saveRoleMutation.mutate()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivation Confirm Dialog */}
      {deactivatingUser && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingUser)}
          onClose={() => setDeactivatingUser(null)}
          onConfirm={() =>
            activeToggleMutation.mutate({
              userId: deactivatingUser.user_id,
              isActive: false,
            })
          }
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${deactivatingUser.full_name} (${deactivatingUser.email})? They will no longer be able to log in, but their historical records will remain intact.`}
          confirmText="Deactivate Account"
          isDangerous={true}
          isLoading={activeToggleMutation.isPending}
        />
      )}
    </div>
  );
};
