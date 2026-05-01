'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { registerAction } from '@/actions/auth.actions'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth.schema'
import { ROUTES } from '@/lib/utils/constants'
import AuthCard from '@/components/auth/AuthCard'
import AuthDivider from '@/components/auth/AuthDivider'
import AuthAlert from '@/components/auth/AuthAlert'
import FormField from '@/components/auth/FormField'
import SubmitButton from '@/components/auth/SubmitButton'
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton'
import type { ActionResult } from '@/types/domain'

const initialState: ActionResult = { success: false, error: '' }

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.message === 'SUCCESS_REDIRECT') {
      router.push(ROUTES.ONBOARDING_PROFILE)
      router.refresh()
    }
  }, [state, router])

  const {
    register,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      subtitle="انضم إلى آلاف الفلاحين والتجار في السوق الفلاحي التونسي"
    >
      <GoogleOAuthButton label="التسجيل عبر Google" />

      <AuthDivider />

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

        <FormField
          {...register('password')}
          label="كلمة المرور"
          type="password"
          placeholder="8 أحرف على الأقل"
          autoComplete="new-password"
          required
          hint="8 أحرف على الأقل"
          error={errors.password?.message}
        />

        {/* Terms + privacy checkbox */}
        <div className="space-y-1">
          <label className="flex cursor-pointer items-start gap-3">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    type="hidden"
                    name="terms"
                    value={field.value ? 'on' : ''}
                  />
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={!!field.value}
                    onClick={() => field.onChange(field.value ? undefined : true)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                      field.value
                        ? 'border-brand-600 bg-brand-600'
                        : errors.terms
                          ? 'border-destructive'
                          : 'border-input bg-white hover:border-brand-400'
                    }`}
                    aria-label="الموافقة على شروط الاستخدام وسياسة الخصوصية"
                  >
                    {field.value && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 12 12"
                        aria-hidden
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </>
              )}
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              أوافق على{' '}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-brand-600 hover:underline"
              >
                شروط الاستخدام
              </Link>{' '}
              و{' '}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="font-medium text-brand-600 hover:underline"
              >
                سياسة الخصوصية
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="text-xs text-destructive">
              {errors.terms.message}
            </p>
          )}
        </div>

        <SubmitButton label="إنشاء الحساب" loadingLabel="جاري الإنشاء..." />
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          تسجيل الدخول
        </Link>
      </p>
    </AuthCard>
  )
}
