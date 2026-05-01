'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  currentFilter: 'all' | 'unread' | 'read'
  unreadCount: number
}

export default function NotificationsFilter({ currentFilter, unreadCount }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilterChange(filter: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (filter === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', filter)
    }
    // Reset to page 1 when filter changes
    params.delete('page')
    router.push(`/notifications?${params.toString()}`)
  }

  return (
    <div className="notifications-filter" dir="rtl">
      <div className="notifications-filter__options">
        <button
          className={`notifications-filter__btn ${currentFilter === 'all' ? 'notifications-filter__btn--active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          الكل
        </button>
        <button
          className={`notifications-filter__btn ${currentFilter === 'unread' ? 'notifications-filter__btn--active' : ''}`}
          onClick={() => handleFilterChange('unread')}
        >
          غير مقروء
          {unreadCount > 0 && (
            <span className="notifications-filter__count">{unreadCount}</span>
          )}
        </button>
        <button
          className={`notifications-filter__btn ${currentFilter === 'read' ? 'notifications-filter__btn--active' : ''}`}
          onClick={() => handleFilterChange('read')}
        >
          تمت قراءتها
        </button>
      </div>
    </div>
  )
}
