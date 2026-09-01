// ==============================================================================
// TAHAB HOTEL & SUITES LTD — PERMISSION EDITOR COMPONENT
// ==============================================================================

import React from 'react';
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type StaffPermission,
} from '../../types';

interface PermissionEditorProps {
  selectedPermissions: StaffPermission[];
  onChange: (permissions: StaffPermission[]) => void;
  disabled?: boolean;
}

export const PermissionEditor: React.FC<PermissionEditorProps> = ({
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const togglePermission = (perm: StaffPermission) => {
    if (disabled) return;
    if (selectedPermissions.includes(perm)) {
      onChange(selectedPermissions.filter((p) => p !== perm));
    } else {
      onChange([...selectedPermissions, perm]);
    }
  };

  const toggleGroup = (perms: StaffPermission[]) => {
    if (disabled) return;
    const allSelected = perms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !perms.includes(p)));
    } else {
      const set = new Set([...selectedPermissions, ...perms]);
      onChange(Array.from(set));
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPerms]) => {
        const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));
        const someSelected = groupPerms.some((p) => selectedPermissions.includes(p));

        return (
          <div
            key={groupName}
            className="bg-warm-50 p-4 rounded-sm border border-stone-200 space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                {groupName}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleGroup(groupPerms)}
                  className="text-[10px] uppercase font-bold text-gold-700 hover:text-emerald-950"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupPerms.map((perm) => {
                const checked = selectedPermissions.includes(perm);
                return (
                  <label
                    key={perm}
                    className={`flex items-center gap-2.5 p-2 rounded-sm text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-emerald-950/10 text-emerald-950 font-semibold border border-emerald-950/20'
                        : 'text-stone-700 hover:bg-stone-100'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => togglePermission(perm)}
                      className="w-3.5 h-3.5 text-emerald-950 rounded border-stone-300 focus:ring-gold-500"
                    />
                    <span>{PERMISSION_LABELS[perm]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
