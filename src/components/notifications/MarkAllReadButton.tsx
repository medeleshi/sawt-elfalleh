// src/components/notifications/MarkAllReadButton.tsx
'use client'

import { useTransition } from 'react'
import { markAllNotificationsReadAction } from '@/actions/notifications.actions'

interface Props {
  unreadCount: number
}

export default function MarkAllReadButton({ unreadCount }: Props) {
  const [isPending, startTransition] = useTransition()

  if (unreadCount === 0) return null

  function handleClick() {
    startTransition(async () => {
      await markAllNotificationsReadAction()
    })
  }

  return (
    <button
      className="mark-all-btn"
      onClick={handleClick}
      disabled={isPending}
      dir="rtl"
    >
      {isPending ? (
        <>
          <span className="mark-all-btn__spinner" />
          جاري التحديث...
        </>
      ) : (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7.5l4 4 7-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          تحديد الكل كمقروء
        </>
      )}
    </button>
  )
}
