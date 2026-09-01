// ==============================================================================
// TAHAB HOTEL & SUITES LTD — AUDIT LOG SERVICE
// ==============================================================================

import { assertSupabaseConfigured } from '../lib/supabase';
import type { AuditLog } from '../types';
import { toSafeError } from '../types';

export interface AuditFilters {
  action?: string;
  entityType?: string;
  actorId?: string;
  limit?: number;
}

/**
 * Fetch audit logs (admin-only view).
 */
export async function getAuditLogs(filters?: AuditFilters): Promise<AuditLog[]> {
  const sb = assertSupabaseConfigured();

  let query = sb
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  if (filters?.actorId) {
    query = query.eq('actor_id', filters.actorId);
  }

  query = query.limit(filters?.limit ?? 100);

  const { data, error } = await query;
  if (error) throw new Error(toSafeError(error));

  return (data ?? []) as AuditLog[];
}

/**
 * Append an action to the audit log via the log_audit_action RPC.
 */
export async function logAuditAction(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const sb = assertSupabaseConfigured();

  const { data, error } = await sb.rpc('log_audit_action', {
    p_action: action,
    p_entity_type: entityType || null,
    p_entity_id: entityId || null,
    p_metadata: metadata || null,
  });

  if (error) {
    console.warn('[auditService] Failed to record audit log:', error.message);
    return '';
  }

  return data as string;
}
