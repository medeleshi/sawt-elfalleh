// src/app/loading.tsx
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function Loading() {
  return (
    <div
      className="system-loading"
      role="status"
      aria-label="جاري التحميل"
    >
      <LoadingSpinner size="lg" />
      <p className="system-loading__label">جاري التحميل...</p>
    </div>
  )
}
