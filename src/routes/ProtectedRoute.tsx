// ==============================================================================
// TAHAB HOTEL & SUITES LTD — PRODUCTION PROTECTED ROUTE GUARD
//
// Enforces authentication, active status, role hierarchy, and granular permissions.
// ==============================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/common/Skeleton';
import type { StaffPermission } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireStaff?: boolean;
  requirePermission?: StaffPermission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireStaff = false,
  requirePermission,
}) => {
  const { user, isLoading, isAdmin, isSuperAdmin, isStaffOrAdmin, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-6">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Skeleton className="h-10 w-10 mx-auto rounded-full bg-gold-500/20" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving intended target
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Deactivated user -> kick out
  if (!user.isActive) {
    return <Navigate to="/login" replace />;
  }

  // Super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/staff" replace />;
  }

  // Staff requirement (staff, admin, super_admin)
  if (requireStaff && !isStaffOrAdmin) {
    return <Navigate to="/account" replace />;
  }

  // Specific granular permission check
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
};
