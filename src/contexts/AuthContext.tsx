// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AUTHENTICATION CONTEXT
//
// PRODUCTION RULES:
//   ✓ Uses Supabase Auth exclusively — no local fallbacks
//   ✓ No demo accounts, no hardcoded credentials
//   ✓ Session managed by Supabase (localStorage via supabase-js)
//   ✓ Listens to onAuthStateChange for real-time session updates
//   ✓ Loads user permissions from staff_permissions table
//   ✓ Role and is_active are authoritative from the profiles table
//   ✓ Deactivated users (is_active=false) are signed out automatically
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, assertSupabaseConfigured } from '../lib/supabase';
import type { UserRole, StaffPermission } from '../types';

// The authenticated user session — derived from Supabase Auth + profiles table
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  position?: string;
  permissions: StaffPermission[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaffOrAdmin: boolean;
  hasPermission: (permission: StaffPermission) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadUserFromSession(userId: string, email: string): Promise<AuthUser | null> {
  if (!supabase) return null;

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    console.warn('[Auth] Profile not found for user:', userId, profileError ?? '');
    return null;
  }

  // Deactivated accounts cannot authenticate
  if (!profile.is_active) {
    console.warn('[Auth] Deactivated account attempted access:', email);
    await supabase.auth.signOut();
    return null;
  }

  // Admins and super_admins have all permissions implicitly — skip loading
  let permissions: StaffPermission[] = [];
  if (profile.role === 'staff') {
    const { data: permsData } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', userId);

    permissions = (permsData ?? []).map((p: { permission: string }) => p.permission as StaffPermission);
  }

  return {
    id: userId,
    email: profile.email || email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    isActive: profile.is_active,
    phone: profile.phone ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    department: profile.department ?? undefined,
    position: profile.position ?? undefined,
    permissions,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const authUser = await loadUserFromSession(session.user.id, session.user.email ?? '');
      setUser(authUser);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Initial session load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = await loadUserFromSession(session.user.id, session.user.email ?? '');
        if (mounted) setUser(authUser);
      }
      if (mounted) setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setIsLoading(true);
          const authUser = await loadUserFromSession(session.user.id, session.user.email ?? '');
          if (mounted) {
            setUser(authUser);
            setIsLoading(false);
          }
        }

        if (event === 'PASSWORD_RECOVERY') {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const sb = assertSupabaseConfigured();
    setIsLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Sign in failed. Please try again.');

      const maxAttempts = 8;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const authUser = await loadUserFromSession(data.user.id, data.user.email ?? email);
        if (authUser) {
          setUser(authUser);
          setIsLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250 + attempt * 200));
      }

      throw new Error('Your account profile is not ready yet. Please contact the hotel if this continues.');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signUp = async (data: SignUpData): Promise<{ requiresEmailConfirmation: boolean }> => {
    const sb = assertSupabaseConfigured();
    const { error, data: authData } = await sb.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone ?? '',
        },
      },
    });

    if (error) throw error;

    // If the user is immediately confirmed (e.g. in development with email verification disabled)
    const requiresEmailConfirmation = !authData.session;
    return { requiresEmailConfirmation };
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    const sb = assertSupabaseConfigured();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const sb = assertSupabaseConfigured();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const hasPermission = useCallback(
    (permission: StaffPermission): boolean => {
      if (!user || !user.isActive) return false;
      // Admins and super_admins have all permissions
      if (user.role === 'admin' || user.role === 'super_admin') return true;
      // Staff check explicit permission assignments
      return user.permissions.includes(permission);
    },
    [user]
  );

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        isAdmin,
        isSuperAdmin,
        isStaffOrAdmin,
        hasPermission,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
