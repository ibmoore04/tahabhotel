// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN STAFF MANAGEMENT
// ==============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Shield,
  Search,
  UserCheck,
  UserX,
  Edit2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  getStaffMembers,
  setStaffActiveStatus,
  updateStaffRoleAndPermissions,
} from '../../../services/staffService';
import type { StaffMember, StaffPermission, UserRole } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Modal, ConfirmDialog } from '../../../components/common/Modal';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { StaffInviteModal } from '../../../components/admin/StaffInviteModal';
import { PermissionEditor } from '../../../components/admin/PermissionEditor';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { isSuperAdmin } from '../../../utils/permissions';

export const AdminStaffPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editPermissions, setEditPermissions] = useState<StaffPermission[]>([]);
  const [deactivatingStaff, setDeactivatingStaff] = useState<StaffMember | null>(null);

  const { data: staffList, isLoading } = useQuery({
    queryKey: ['staffMembers'],
    queryFn: () => getStaffMembers(),
  });

  const activeToggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setStaffActiveStatus(userId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Staff member has been ${variables.isActive ? 'reactivated' : 'deactivated'}.`,
      });
      setDeactivatingStaff(null);
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.message || 'Could not update status.',
      });
    },
  });

  const saveEditMutation = useMutation({
    mutationFn: () => {
      if (!editingStaff) throw new Error('No staff selected');
      return updateStaffRoleAndPermissions(
        editingStaff.user_id,
        editRole,
        editRole === 'staff' ? editPermissions : [],
        editDepartment,
        editPosition
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      showToast({
        type: 'success',
        title: 'Staff Updated',
        message: 'Role and permissions have been saved.',
      });
      setEditingStaff(null);
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not update staff member.',
      });
    },
  });

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditRole(staff.role);
    setEditDepartment(staff.department || 'Front Desk');
    setEditPosition(staff.position || '');
    setEditPermissions(staff.permissions || []);
  };

  const filteredStaff = (staffList ?? []).filter((s) => {
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <SEO title="Staff Management | Admin Portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-950">
            Hotel Staff & Administrators
          </h1>
          <p className="text-xs text-stone-500">
            Manage employee accounts, assign granular permissions, and control portal access.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={() => setInviteModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, department, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 text-stone-900"
          />
        </div>
      </div>

      {/* Staff Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredStaff.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Department & Position</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-warm-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-950 text-gold-400 font-bold flex items-center justify-center text-xs">
                          {staff.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{staff.full_name}</span>
                          <span className="text-[11px] text-stone-500">{staff.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-stone-800 block">
                        {staff.department || 'General'}
                      </span>
                      <span className="text-[11px] text-stone-500">{staff.position || 'Employee'}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          staff.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : staff.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {staff.role === 'admin' || staff.role === 'super_admin' ? (
                        <span className="text-stone-500 italic">Full Administrative Access</span>
                      ) : (
                        <span className="font-mono text-stone-700">
                          {staff.permissions?.length || 0} Permission(s)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {staff.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {staff.role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(staff)}
                          className="p-1.5 text-stone-700 hover:text-emerald-950"
                          title="Edit Role & Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {staff.user_id !== currentUser?.id && staff.role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (staff.is_active) {
                              setDeactivatingStaff(staff);
                            } else {
                              activeToggleMutation.mutate({
                                userId: staff.user_id,
                                isActive: true,
                              });
                            }
                          }}
                          className={`text-[10px] py-1 px-2.5 ${
                            staff.is_active
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {staff.is_active ? 'Deactivate' : 'Reactivate'}
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
          title="No staff members match criteria"
          description="Click 'Add Staff Member' above to invite your team."
        />
      )}

      {/* Invite Modal */}
      <StaffInviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['staffMembers'] })}
        allowAdminRole={isSuperAdmin(currentUser?.role)}
      />

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Modal
          isOpen={Boolean(editingStaff)}
          onClose={() => setEditingStaff(null)}
          title={`Edit Staff: ${editingStaff.full_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-stone-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm font-bold text-sm text-stone-900"
                >
                  <option value="staff">Staff</option>
                  {isSuperAdmin(currentUser?.role) && (
                    <option value="admin">Administrator</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Department
                </label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm text-sm text-stone-900"
                >
                  <option value="Front Desk">Front Desk</option>
                  <option value="Reservations">Reservations</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Management">Management</option>
                  <option value="Restaurant & Bar">Restaurant & Bar</option>
                  <option value="Security">Security</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Position Title
                </label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 border border-stone-300 rounded-sm text-sm text-stone-900"
                />
              </div>
            </div>

            {editRole === 'staff' && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    Staff Permissions
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {editPermissions.length} granted
                  </span>
                </div>
                <PermissionEditor
                  selectedPermissions={editPermissions}
                  onChange={setEditPermissions}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="ghost" size="sm" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button
                variant="emerald"
                size="md"
                isLoading={saveEditMutation.isPending}
                onClick={() => saveEditMutation.mutate()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivation Confirm Dialog */}
      {deactivatingStaff && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingStaff)}
          onClose={() => setDeactivatingStaff(null)}
          onConfirm={() =>
            activeToggleMutation.mutate({
              userId: deactivatingStaff.user_id,
              isActive: false,
            })
          }
          title="Deactivate Staff Member"
          message={`Are you sure you want to deactivate ${deactivatingStaff.full_name} (${deactivatingStaff.email})? They will no longer be able to log into the staff portal, but their historical audit records will remain intact.`}
          confirmText="Deactivate Account"
          isDangerous={true}
          isLoading={activeToggleMutation.isPending}
        />
      )}
    </div>
  );
};
