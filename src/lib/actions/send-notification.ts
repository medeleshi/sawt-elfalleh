// src/lib/actions/send-notification.ts
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * All notification type keys used across the application.
 * Keeping them in one place prevents typos and makes search/replace trivial.
 */
export type NotificationType =
  // Admin → user
  | 'post_suspended'
  | 'post_restored'
  | 'post_expired_admin'
  | 'user_banned'
  | 'user_restored'
  // System / lifecycle
  | 'post_expired'
  | 'report_reviewed'
  | 'report_dismissed'
  // Social / marketplace
  | 'post_contact'
  | 'post_saved'
  // Feed — new post matching user preferences
  | 'new_post_region'
  | 'new_post_followed_region'
  | 'new_post_activity'
  | 'platform_update'

export interface SendNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body?: string
  data?: Record<string, unknown>
}

/**
 * Insert a single in-app notification row.
 *
 * - Non-critical: errors are logged but never thrown so the calling action
 *   is not blocked if the notification fails.
 * - Pass the already-authenticated supabase client from the calling action
 *   to avoid creating a redundant connection.
 */
export async function sendNotification(
  supabase: SupabaseClient<any>,
  input: SendNotificationInput
): Promise<void> {
  try {
    const { error } = await (supabase.from('notifications') as any).insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      data: input.data ?? {},
    })

    if (error) {
      console.error('[sendNotification] insert error:', error)
    }
  } catch (err) {
    console.error('[sendNotification] unexpected error:', err)
  }
}

/**
 * Insert notifications for multiple recipients in a single DB round-trip.
 * Used for fan-out notifications (e.g. new post → notify all followers).
 *
 * Silent on error — fan-out failures must never block the triggering action.
 */
export async function sendNotificationBulk(
  supabase: SupabaseClient<any>,
  inputs: SendNotificationInput[]
): Promise<void> {
  if (!inputs.length) return
  try {
    const rows = inputs.map((input) => ({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      data: input.data ?? {},
    }))

    const { error } = await (supabase.from('notifications') as any).insert(rows)

    if (error) {
      console.error('[sendNotificationBulk] insert error:', error)
    }
  } catch (err) {
    console.error('[sendNotificationBulk] unexpected error:', err)
  }
}
