import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/db'

export type AdminTargetType = 'user' | 'post' | 'report' | 'category' | 'unit' | null

/**
 * Reusable helper to log administrative actions.
 * Note: This must be called within a server action that has a valid admin session.
 */
export async function logAdminAction(
  supabase: SupabaseClient<Database>,
  adminId: string,
  action: string,
  targetType: AdminTargetType,
  targetId: string | null,
  details: any = {}
) {
  try {
    const { error } = await ((supabase.from('admin_logs') as any).insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || {},
    }) as any)

    if (error) {
      console.error('[logAdminAction] Error inserting log:', error)
    }
  } catch (err) {
    console.error('[logAdminAction] Unexpected error:', err)
  }
}
