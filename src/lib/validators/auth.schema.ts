import { z } from 'zod'

// ─── Reusable field definitions ───────────────────────────────────────────────

const emailField = z
  .string({ required_error: 'البريد الإلكتروني مطلوب' })
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('أدخل بريداً إلكترونياً صحيحاً')

const passwordField = z
  .string({ required_error: 'كلمة المرور مطلوبة' })
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(72, 'كلمة المرور طويلة جداً')

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ required_error: 'كلمة المرور مطلوبة' })
    .min(1, 'كلمة المرور مطلوبة'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Role is limited to farmer | trader | citizen.
 * 'admin' is never selectable from the register UI — per docs section 4.1.
 */
export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  terms: z.literal(true, {
    errorMap: () => ({ message: 'يجب الموافقة على شروط الاستخدام' }),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>

// ─── Forgot password ──────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// ─── Reset password ───────────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z
      .string({ required_error: 'تأكيد كلمة المرور مطلوب' })
      .min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
