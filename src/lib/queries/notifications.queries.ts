// src/lib/queries/notifications.queries.ts
// Read queries for the notifications system.
// Structured so Supabase Realtime can be plugged in later without refactoring.

import { createClient } from '@/lib/supabase/server'

export const NOTIFICATIONS_PAGE_SIZE = 20

export type NotificationRow = {
  id: string
  user_id: string
  type: string
  title: string | null
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export type NotificationsResult = {
  notifications: NotificationRow[]
  unreadCount: number
  total: number
  page: number
  totalPages: number
}

/**
 * Fetch paginated notifications for the logged-in user.
 * Returns notifications ordered by created_at desc.
 */
export async function getNotifications(
  userId: string,
  page: number = 1,
  filter: 'all' | 'unread' | 'read' = 'all'
): Promise<NotificationsResult> {
  const supabase = await createClient()
  const limit = NOTIFICATIONS_PAGE_SIZE
  const offset = (page - 1) * limit

  // Fetch paginated notifications
  let query = supabase
    .from('notifications')
    .select('id, user_id, type, title, body, data, is_read, created_at', {
      count: 'exact',
    })
    .eq('user_id', userId)

  if (filter === 'unread') {
    query = query.eq('is_read', false)
  } else if (filter === 'read') {
    query = query.eq('is_read', true)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getNotifications] error:', error)
    return { notifications: [], unreadCount: 0, total: 0, page, totalPages: 0 }
  }

  // Fetch unread count (separate small query)
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    notifications: (data as NotificationRow[]) ?? [],
    unreadCount: unreadCount ?? 0,
    total,
    page,
    totalPages,
  }
}
