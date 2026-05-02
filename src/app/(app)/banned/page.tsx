import { ShieldAlert, Mail } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export const metadata = {
  title: 'حساب موقوف | صوت الفلاح',
}

export default function BannedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            تم تجميد حسابك مؤقتاً
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            نعتذر، لقد تم تقييد وصولك إلى خدمات التطبيق نظراً لمخالفة محتملة لشروط الاستخدام أو بناءً على إجراء إداري لحماية المجتمع.
          </p>
        </div>

        <div className="w-full rounded-xl bg-muted/50 p-4 text-sm text-foreground">
          <p className="mb-3 font-medium">ماذا يمكنك أن تفعل الآن؟</p>
          <ul className="space-y-2 text-right text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0"></span>
              لا يزال بإمكانك تصفح الإعلانات المتاحة للعموم.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0"></span>
              لا يمكنك نشر إعلانات جديدة، الردود، أو مراسلة البائعين.
            </li>
          </ul>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <a
            href="mailto:support@sawt-elfalleh.com"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Mail className="h-4 w-4" />
            تواصل مع الإدارة للدعم
          </a>
          <Link
            href={ROUTES.HOME}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
