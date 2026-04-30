'use client'

import { useFormState } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordAction } from '@/actions/auth.actions'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth.schema'
import AuthCard from '@/components/auth/AuthCard'
import AuthAlert from '@/components/auth/AuthAlert'
import FormField from '@/components/auth/FormField'
import SubmitButton from '@/components/auth/SubmitButton'
import type { ActionResult } from '@/types/domain'

const initialState: ActionResult = { success: false, error: '' }

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState)

  const {
    register,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  return (
    <AuthCard
      title="تعيين كلمة مرور جديدة"
      subtitle="اختر كلمة مرور قوية لحماية حسابك"
    >
      {!state.success && state.error && (
        <AuthAlert type="error" message={state.error} className="mb-4" />
      )}

      <form action={formAction} className="space-y-4" noValidate>
        <FormField
          {...register('password')}
          label="كلمة المرور الجديدة"
          type="password"
          placeholder="8 أحرف على الأقل"
          autoComplete="new-password"
          required
          hint="8 أحرف على الأقل"
          error={errors.password?.message}
        />

        <FormField
          {...register('confirmPassword')}
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="أعد كتابة كلمة المرور"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
        />

        <SubmitButton label="حفظ كلمة المرور" loadingLabel="جاري الحفظ..." />
      </form>
    </AuthCard>
  )
}
