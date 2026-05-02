import { ShieldAlert, Mail, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export const metadata = {
  title: 'حساب موقوف | صوت الفلاح',
}

export default function BannedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            تم تجميد حسابك مؤقتاً
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            نعتذر، لقد تم تقييد وصولك إلى خدمات التطبيق الأساسية (بما في ذلك سوق الفلاح والمنشورات) نظراً لمخالفة شروط الاستخدام أو بناءً على إجراء إداري.
          </p>
        </div>

        <div className="w-full rounded-xl bg-muted/50 p-5 text-sm text-foreground">
          <p className="mb-3 font-semibold text-destructive">القيود الحالية:</p>
          <ul className="space-y-2.5 text-right text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0"></span>
              لا يمكنك تصفح سوق الفلاح أو رؤية تفاصيل المنشورات.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0"></span>
              لا يمكنك التفاعل، التعليق، أو مراسلة المستخدمين.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0"></span>
              بإمكانك فقط تصفح صفحات التعريف والاتصال بالإدارة.
            </li>
          </ul>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <MessageCircle className="h-4 w-4" />
            تواصل مع الإدارة لتقديم طلب مراجعة
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/landing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              صفحة التعريف
            </Link>
            <a
              href="mailto:support@sawt-elfalleh.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5" />
              البريد الرسمي
            </a>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          معرّف الحساب للمراجعة: يتم التحقق منه تلقائياً عبر جلسة تسجيل الدخول
        </p>
      </div>
    </div>
  )
}
