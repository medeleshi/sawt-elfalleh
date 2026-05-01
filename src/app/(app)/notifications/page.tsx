// src/app/(app)/notifications/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries/notifications.queries'
import NotificationsList from '@/components/notifications/NotificationsList'
import NotificationsFilter from '@/components/notifications/NotificationsFilter'
import MarkAllReadButton from '@/components/notifications/MarkAllReadButton'
import Pagination from '@/components/shared/Pagination'
import { APP_NAME } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: `الإشعارات | ${APP_NAME}`,
}

interface PageProps {
  searchParams: { page?: string; filter?: string }
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  // Auth guard (middleware also handles this, but belt + braces)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const filter = (searchParams.filter as 'all' | 'unread' | 'read') || 'all'

  const { notifications, unreadCount, total, totalPages } = await getNotifications(
    user.id,
    page,
    filter
  )

  const paginationInfo = {
    page,
    totalPages,
    total,
    limit: 20,
  }

  return (
    <div className="notifications-page" dir="rtl">
      {/* ── Page header ── */}
      <div className="notifications-page__header">
        <div className="notifications-page__title-row">
          <h1 className="notifications-page__title">
            الإشعارات
            {unreadCount > 0 && (
              <span className="notifications-page__badge" aria-label={`${unreadCount} غير مقروء`}>
                {unreadCount > 99 ? '+99' : unreadCount}
              </span>
            )}
          </h1>

          <MarkAllReadButton unreadCount={unreadCount} />
        </div>

        {total > 0 && (
          <p className="notifications-page__meta">
            {total} إشعار{unreadCount > 0 ? ` · ${unreadCount} غير مقروء` : ''}
          </p>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <NotificationsFilter currentFilter={filter} unreadCount={unreadCount} />

      {/* ── Notifications list (Server renders initial data) ── */}
      <NotificationsList notifications={notifications} filter={filter} />

      {/* ── Pagination ── */}
      {totalPages > 1 && <Pagination pagination={paginationInfo} />}
    </div>
  )
}
