// src/components/notifications/NotificationItem.tsx
'use client'

import { useTransition } from 'react'
import { markNotificationReadAction } from '@/actions/notifications.actions'
import { formatRelativeTime } from '@/lib/utils/format'
import type { NotificationRow } from '@/lib/queries/notifications.queries'

// ─── Type badge config ────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: string; colorClass: string }> = {
  // ─── Feed ──────────────────────────────────────────────────────────────────
  new_post_region: {
    label: 'منشور جديد في ولايتك',
    icon: '📍',
    colorClass: 'notification-badge--region',
  },
  new_post_followed_region: {
    label: 'منشور في ولاية تتابعها',
    icon: '🗺️',
    colorClass: 'notification-badge--region',
  },
  new_post_activity: {
    label: 'منشور يناسب نشاطك',
    icon: '🌾',
    colorClass: 'notification-badge--activity',
  },
  platform_update: {
    label: 'تحديث المنصة',
    icon: '📢',
    colorClass: 'notification-badge--platform',
  },

  // ─── Social / marketplace ──────────────────────────────────────────────────
  post_contact: {
    label: 'طلب تواصل',
    icon: '📞',
    colorClass: 'notification-badge--contact',
  },
  post_saved: {
    label: 'حفظ إعلان',
    icon: '🔖',
    colorClass: 'notification-badge--saved',
  },

  // ─── Admin → user ──────────────────────────────────────────────────────────
  post_suspended: {
    label: 'إعلان موقوف',
    icon: '⛔',
    colorClass: 'notification-badge--warning',
  },
  post_restored: {
    label: 'إعلان مستعاد',
    icon: '✅',
    colorClass: 'notification-badge--success',
  },
  post_expired_admin: {
    label: 'إعلان منتهي الصلاحية',
    icon: '⏰',
    colorClass: 'notification-badge--warning',
  },
  user_banned: {
    label: 'حساب موقوف',
    icon: '🚫',
    colorClass: 'notification-badge--danger',
  },
  user_restored: {
    label: 'حساب مستعاد',
    icon: '✅',
    colorClass: 'notification-badge--success',
  },

  // ─── Reports ───────────────────────────────────────────────────────────────
  report_reviewed: {
    label: 'بلاغ تمت مراجعته',
    icon: '🔍',
    colorClass: 'notification-badge--info',
  },
  report_dismissed: {
    label: 'بلاغ مرفوض',
    icon: '📋',
    colorClass: 'notification-badge--default',
  },

  // ─── System / lifecycle ────────────────────────────────────────────────────
  post_expired: {
    label: 'إعلان منتهي الصلاحية',
    icon: '⏰',
    colorClass: 'notification-badge--warning',
  },
}

const DEFAULT_TYPE = {
  label: 'إشعار',
  icon: '🔔',
  colorClass: 'notification-badge--default',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  notification: NotificationRow
}

export default function NotificationItem({ notification }: Props) {
  const [isPending, startTransition] = useTransition()
  const typeConfig = TYPE_CONFIG[notification.type] ?? DEFAULT_TYPE

  function handleMarkRead() {
    if (notification.is_read || isPending) return
    startTransition(async () => {
      await markNotificationReadAction(notification.id)
    })
  }

  return (
    <div
      className={`notification-item ${notification.is_read ? 'notification-item--read' : 'notification-item--unread'} ${isPending ? 'notification-item--loading' : ''}`}
      dir="rtl"
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span className="notification-item__dot" aria-hidden="true" />
      )}

      {/* Icon */}
      <span className="notification-item__icon" aria-hidden="true">
        {typeConfig.icon}
      </span>

      {/* Content */}
      <div className="notification-item__content">
        <div className="notification-item__header">
          <span className={`notification-badge ${typeConfig.colorClass}`}>
            {typeConfig.label}
          </span>
          <time className="notification-item__time" dateTime={notification.created_at}>
            {formatRelativeTime(notification.created_at)}
          </time>
        </div>

        {notification.title && (
          <p className="notification-item__title">{notification.title}</p>
        )}
        {notification.body && (
          <p className="notification-item__body">{notification.body}</p>
        )}
      </div>

      {/* Mark as read button */}
      {!notification.is_read && (
        <button
          className="notification-item__action"
          onClick={handleMarkRead}
          disabled={isPending}
          aria-label="تحديد كمقروء"
          title="تحديد كمقروء"
        >
          {isPending ? (
            <span className="notification-item__spinner" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M5 8l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
