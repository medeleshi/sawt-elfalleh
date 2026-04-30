import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <span className="text-7xl" role="img" aria-label="404">
        🌾
      </span>
      <div>
        <h1 className="text-4xl font-bold text-brand-700">404</h1>
        <p className="mt-2 text-lg font-medium text-foreground">
          الصفحة غير موجودة
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ربما تم حذف هذه الصفحة أو تغيير رابطها.
        </p>
      </div>
      <Link
        href={ROUTES.HOME}
        className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
