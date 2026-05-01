// src/app/offline/page.tsx
'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export default function OfflinePage() {
  return (
    <div className="system-page" dir="rtl">
      <div className="system-page__card">

        {/* Illustration */}
        <div className="system-page__visual" aria-hidden="true">
          <span className="system-page__emoji">📡</span>
          <div className="system-page__signal-bars" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
        </div>

        {/* Copy */}
        <div className="system-page__copy">
          <h1 className="system-page__title">لا يوجد اتصال بالإنترنت</h1>
          <p className="system-page__desc">
            تحقق من اتصالك بالشبكة أو بيانات الهاتف،
            <br />
            ثم اضغط "إعادة المحاولة".
          </p>
        </div>

        {/* Actions */}
        <div className="system-page__actions">
          <button
            onClick={() => window.location.reload()}
            className="sys-btn sys-btn--primary"
          >
            إعادة المحاولة
          </button>
          <Link href={ROUTES.HOME} className="sys-btn sys-btn--outline">
            الرئيسية
          </Link>
        </div>

      </div>
    </div>
  )
}
