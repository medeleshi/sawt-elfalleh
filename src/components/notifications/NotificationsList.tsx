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
}

export default function NotificationsList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="لا توجد إشعارات"
        description="ستظهر هنا إشعاراتك عند وجود منشورات جديدة في ولايتك أو نشاطك"
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
