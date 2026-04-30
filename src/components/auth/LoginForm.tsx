'use client'

import { useFormState } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { loginAction } from '@/actions/auth.actions'
import { loginSchema, type LoginInput } from '@/lib/validators/auth.schema'
import { ROUTES } from '@/lib/utils/constants'
import AuthCard from '@/components/auth/AuthCard'
import AuthDivider from '@/components/auth/AuthDivider'
import AuthAlert from '@/components/auth/AuthAlert'
import FormField from '@/components/auth/FormField'
import SubmitButton from '@/components/auth/SubmitButton'
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton'
import type { ActionResult } from '@/types/domain'

const initialState: ActionResult = { success: false, error: '' }

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)

  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  return (
    <AuthCard
      title="تسجيل الدخول"
      subtitle="سوقك الفلاحي التونسي — تواصل مباشرة مع الفلاحين والتجار"
    >
      <GoogleOAuthButton label="تسجيل الدخول عبر Google" />

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

        <div className="space-y-1.5">
          <FormField
            {...register('password')}
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={errors.password?.message}
          />
          <div className="text-end">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        <SubmitButton label="تسجيل الدخول" loadingLabel="جاري الدخول..." />
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{' '}
        <Link
          href={ROUTES.REGISTER}
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          أنشئ حساباً الآن
        </Link>
      </p>
    </AuthCard>
  )
}
