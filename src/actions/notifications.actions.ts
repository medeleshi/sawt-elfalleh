// src/actions/notifications.actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/domain'

/**
 * Mark a single notification as read.
 * RLS ensures only the owner can update their own notifications.
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  if (!notificationId || typeof notificationId !== 'string') {
    return { success: false, error: 'معرّف الإشعار غير صالح' }
  }

  const supabase = (await createClient()) as any

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('[markNotificationReadAction] error:', error)
    return { success: false, error: 'فشل تحديث الإشعار' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Mark ALL notifications as read for the current user.
 * Supabase RLS restricts the update to the authenticated user's rows only.
 */
export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const supabase = (await createClient()) as any

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('[markAllNotificationsReadAction] error:', error)
    return { success: false, error: 'فشل تحديث الإشعارات' }
  }

  revalidatePath('/notifications')
  return { success: true }
}
