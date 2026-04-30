import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'
import AuthCard from '@/components/auth/AuthCard'

export const metadata: Metadata = {
  title: 'تم تغيير كلمة المرور',
}

/**
 * Reset success page — fully static server component.
 * Reached via redirect() inside resetPasswordAction.
 */
export default function ResetSuccessPage() {
  return (
    <AuthCard
      title="تم تغيير كلمة المرور"
      subtitle="يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة"
    >
      {/* Success icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <CheckCircle2
            className="h-8 w-8 text-brand-600"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </div>

      <p className="mb-6 text-center text-sm text-muted-foreground leading-relaxed">
        تم تحديث كلمة مرورك بنجاح. سجّل دخولك الآن للوصول إلى حسابك.
      </p>

      <Link
        href={ROUTES.LOGIN}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        تسجيل الدخول
      </Link>
    </AuthCard>
  )
}
