'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validators/auth.schema'
import { ROUTES, APP_URL } from '@/lib/utils/constants'
import type { ActionResult } from '@/types/domain'

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email:    formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: mapAuthError(error.message) }
  }

  // Middleware handles the onboarding redirect check.
  redirect(ROUTES.HOME)
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email:    formData.get('email'),
    password: formData.get('password'),
    // Checkbox sends 'on' when checked, null when not
    terms:    formData.get('terms') === 'on' ? true : false,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Step 1: Create auth user.
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (signUpError) {
    return { success: false, error: mapAuthError(signUpError.message) }
  }

  if (!authData.user) {
    return { success: false, error: 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.' }
  }

  // Step 2: Redirect to onboarding. 
  // We use a small delay or a client-side friendly redirect by returning success.
  return { success: true, message: 'SUCCESS_REDIRECT' }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function googleOAuthAction(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Use APP_URL constant which has a safe fallback to localhost
      redirectTo: `${APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error || !data.url) {
    return { success: false, error: 'تعذّر الاتصال بـ Google. يرجى المحاولة مجدداً.' }
  }

  return { success: true, data: { url: data.url } }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get('email') }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // Use APP_URL constant which has a safe fallback to localhost
    redirectTo: `${APP_URL}${ROUTES.RESET_PASSWORD}`,
  })

  if (error) {
    return { success: false, error: 'تعذّر إرسال رابط إعادة التعيين. يرجى المحاولة مجدداً.' }
  }

  // Always return success — do not reveal whether email exists (security)
  return { success: true }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    password:        formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = resetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: mapAuthError(error.message) }
  }

  // Use ROUTES constant — no hardcoded strings
  redirect(ROUTES.RESET_SUCCESS)
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }
  if (message.includes('Email already registered') || message.includes('User already registered')) {
    return 'هذا البريد الإلكتروني مسجّل مسبقاً. يمكنك تسجيل الدخول.'
  }
  if (message.includes('Password should be at least')) {
    return 'كلمة المرور قصيرة جداً.'
  }
  if (message.includes('Unable to validate email address')) {
    return 'البريد الإلكتروني غير صالح.'
  }
  if (message.includes('Email rate limit exceeded') || message.includes('over_email_send_rate_limit')) {
    return 'تم إرسال طلبات كثيرة جداً. يرجى الانتظار بضع دقائق قبل المحاولة مجدداً.'
  }
  if (message.includes('same password')) {
    return 'كلمة المرور الجديدة يجب أن تختلف عن القديمة.'
  }
  return 'حدث خطأ. يرجى المحاولة مجدداً.'
}
