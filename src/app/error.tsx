// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Wire up your error monitoring service here (e.g. Sentry)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="system-page" dir="rtl">
      <div className="system-page__card">

        {/* Illustration */}
        <div className="system-page__visual" aria-hidden="true">
          <span className="system-page__emoji">⚠️</span>
          <span className="system-page__code system-page__code--warn">خطأ</span>
        </div>

        {/* Copy */}
        <div className="system-page__copy">
          <h1 className="system-page__title">حدث خطأ غير متوقع</h1>
          <p className="system-page__desc">
            عذراً، حدث خطأ ما في الخادم. يمكنك إعادة المحاولة
            <br />
            أو العودة للصفحة الرئيسية.
          </p>
          {error.digest && (
            <p className="system-page__digest">
              رمز الخطأ: <code>{error.digest}</code>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="system-page__actions">
          <button onClick={reset} className="sys-btn sys-btn--primary">
            إعادة المحاولة
          </button>
          <Link href={ROUTES.HOME} className="sys-btn sys-btn--outline">
            الرئيسية
          </Link>
          <Link href={ROUTES.MARKETPLACE} className="sys-btn sys-btn--ghost">
            تصفح السوق
          </Link>
        </div>

      </div>
    </div>
  )
}
