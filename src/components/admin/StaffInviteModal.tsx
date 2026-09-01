// ==============================================================================
// TAHAB HOTEL & SUITES LTD — STAFF INVITATION MODAL
// ==============================================================================

import React, { useState } from 'react';
import { UserPlus, Mail, User, Phone, Briefcase } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PermissionEditor } from './PermissionEditor';
import { inviteStaff } from '../../services/staffService';
import { useToast } from '../../contexts/ToastContext';
import type { StaffPermission, UserRole } from '../../types';

interface StaffInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allowAdminRole?: boolean;
}

export const StaffInviteModal: React.FC<StaffInviteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allowAdminRole = false,
}) => {
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Front Desk');
  const [position, setPosition] = useState('Receptionist');
  const [role, setRole] = useState<UserRole>('staff');
  const [permissions, setPermissions] = useState<StaffPermission[]>([
    'view_bookings',
    'check_in_guest',
    'check_out_guest',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setIsSubmitting(true);
    try {
      const result = await inviteStaff({
        fullName,
        email,
        phone,
        department,
        position,
        role,
        permissions: role === 'staff' ? permissions : [],
      });

      showToast({
        type: 'success',
        title: 'Staff Invited',
        message: result.message,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Invite Failed',
        message: err?.message || 'Could not send invitation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add & Invite Staff Member"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-stone-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Samuel Olaniyan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="staff@tahabhotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+234 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
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
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 font-bold"
            >
              <option value="staff">Staff (Operational)</option>
              {allowAdminRole && <option value="admin">Administrator (Full Access)</option>}
            </select>
          </div>
        </div>

        {role === 'staff' && (
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-700">
                Assigned Operational Permissions
              </span>
              <span className="text-[11px] text-stone-400">
                {permissions.length} permission(s) granted
              </span>
            </div>
            <PermissionEditor
              selectedPermissions={permissions}
              onChange={setPermissions}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Send Invitation & Grant Role
          </Button>
        </div>
      </form>
    </Modal>
  );
};
