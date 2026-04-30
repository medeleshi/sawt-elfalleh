'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <span className="text-6xl" role="img" aria-label="خطأ">
        ⚠️
      </span>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          عذراً، حدث خطأ ما. يرجى المحاولة مجدداً.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
