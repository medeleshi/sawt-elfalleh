'use client'

import { useFormState } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { forgotPasswordAction } from '@/actions/auth.actions'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/auth.schema'
import { ROUTES } from '@/lib/utils/constants'
import AuthCard from '@/components/auth/AuthCard'
import AuthAlert from '@/components/auth/AuthAlert'
import FormField from '@/components/auth/FormField'
import SubmitButton from '@/components/auth/SubmitButton'
import type { ActionResult } from '@/types/domain'

const initialState: ActionResult = { success: false, error: '' }

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState)

  const {
    register,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  return (
    <AuthCard
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
    >
      {state.success ? (
        /* ── Success state ─────────────────────────────────────── */
        <div className="space-y-4">
          <AuthAlert
            type="success"
            message="تم إرسال رابط إعادة التعيين. تحقق من بريدك الإلكتروني."
          />
          <p className="text-center text-sm text-muted-foreground">
            لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب (Spam).
          </p>
          <Link
            href={ROUTES.LOGIN}
            className="flex h-10 w-full items-center justify-center rounded-lg border border-input bg-white text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      ) : (
        /* ── Form state ────────────────────────────────────────── */
        <>
          {!state.success && state.error && (
            <AuthAlert type="error" message={state.error} className="mb-4" />
          )}

          <form action={formAction} className="space-y-4" noValidate>
            <FormField
              {...register('email')}
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              inputMode="email"
              required
              error={errors.email?.message}
            />

            <SubmitButton
              label="إرسال رابط الاستعادة"
              loadingLabel="جاري الإرسال..."
            />
          </form>

          <p className="mt-5 text-center text-sm">
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              العودة لتسجيل الدخول →
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}
