// src/components/notifications/NotificationsList.tsx
//
// Phase 2 note:
// To add Supabase Realtime, wrap this component with a provider that
// subscribes to `supabase.channel('notifications').on('postgres_changes', ...)`
// and prepends new rows to `notifications` via useState.
// The server-fetched initial data flows in via props — no refactor needed.

'use client'

import NotificationItem from './NotificationItem'
import EmptyState from '@/components/shared/EmptyState'
import type { NotificationRow } from '@/lib/queries/notifications.queries'

interface Props {
  notifications: NotificationRow[]
  filter: 'all' | 'unread' | 'read'
}

export default function NotificationsList({ notifications, filter }: Props) {
  if (notifications.length === 0) {
    const emptyMessages = {
      all: 'ستظهر هنا إشعاراتك عند وجود منشورات جديدة في ولايتك أو نشاطك',
      unread: 'ليس لديك أي إشعارات غير مقروءة حالياً',
      read: 'لم تقم بقراءة أي إشعارات بعد',
    }

    return (
      <EmptyState
        icon={filter === 'unread' ? '✅' : '🔔'}
        title={filter === 'unread' ? 'أنت متابع لكل شيء!' : 'لا توجد إشعارات'}
        description={emptyMessages[filter]}
      />
    )
  }

  return (
    <div className="notifications-list" role="list" aria-label="قائمة الإشعارات">
      {notifications.map((n) => (
        <div key={n.id} role="listitem">
          <NotificationItem notification={n} />
        </div>
      ))}
    </div>
  )
}
