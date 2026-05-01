// src/app/not-found.tsx
import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export default function NotFound() {
  return (
    <div className="system-page" dir="rtl">
      <div className="system-page__card">

        {/* Illustration */}
        <div className="system-page__visual" aria-hidden="true">
          <span className="system-page__emoji">🌾</span>
          <span className="system-page__code">404</span>
        </div>

        {/* Copy */}
        <div className="system-page__copy">
          <h1 className="system-page__title">الصفحة غير موجودة</h1>
          <p className="system-page__desc">
            ربما تم حذف هذه الصفحة أو تغيير رابطها.
            <br />
            تحقق من الرابط أو ابدأ من الصفحة الرئيسية.
          </p>
        </div>

        {/* Actions */}
        <div className="system-page__actions">
          <Link href={ROUTES.HOME} className="sys-btn sys-btn--primary">
            الرئيسية
          </Link>
          <Link href={ROUTES.MARKETPLACE} className="sys-btn sys-btn--outline">
            تصفح السوق
          </Link>
        </div>

      </div>
    </div>
  )
}
