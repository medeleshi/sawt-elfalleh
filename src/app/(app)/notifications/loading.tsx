// src/app/(app)/notifications/loading.tsx
export default function NotificationsLoading() {
  return (
    <div className="notifications-page" dir="rtl">
      {/* Header skeleton */}
      <div className="notifications-page__header">
        <div className="notifications-page__title-row">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--btn" />
        </div>
        <div className="skeleton skeleton--meta" />
      </div>

      {/* Item skeletons */}
      <div className="notifications-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="notification-item notification-item--skeleton">
            <div className="skeleton skeleton--icon" />
            <div className="notification-item__content">
              <div className="skeleton skeleton--badge" />
              <div className="skeleton skeleton--text-lg" />
              <div className="skeleton skeleton--text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
