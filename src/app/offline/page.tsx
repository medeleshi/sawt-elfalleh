'use client'
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <span className="text-6xl" role="img" aria-label="لا يوجد إنترنت">
        📡
      </span>
      <div>
        <h1 className="text-2xl font-bold text-foreground">لا يوجد اتصال بالإنترنت</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          تحقق من اتصالك بالإنترنت وحاول مجدداً.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
