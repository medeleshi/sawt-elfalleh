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
    role:     formData.get('role'),
    // Checkbox sends 'on' when checked, null when not
    terms:    formData.get('terms') === 'on' ? true : false,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Step 1: Create auth user.
  // The DB trigger handle_new_user() auto-creates profiles + notification_settings.
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { role: parsed.data.role },
    },
  })

  if (signUpError) {
    return { success: false, error: mapAuthError(signUpError.message) }
  }

  if (!authData.user) {
    return { success: false, error: 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.' }
  }

  // Step 2: Set the chosen role on the profile row.
  // Use upsert to avoid a race condition where the trigger insert hasn't
  // completed before this update runs.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      { 
        id: authData.user.id, 
        role: parsed.data.role,
        full_name: '', // Required field, will be filled in onboarding
        show_phone: true,
        is_profile_completed: false
      } as any,
      { onConflict: 'id' }
    )

  if (profileError) {
    // Role failed to save — account exists but role is wrong.
    // Return error so user knows to try again; do not silently proceed.
    return {
      success: false,
      error: 'تم إنشاء الحساب لكن تعذّر حفظ نوع الحساب. يرجى المحاولة مجدداً.',
    }
  }

  // After register → always go to onboarding (is_profile_completed = false)
  redirect(ROUTES.ONBOARDING_PROFILE)
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
  if (message.includes('Email rate limit exceeded')) {
    return 'تم إرسال طلبات كثيرة. يرجى الانتظار قبل المحاولة مجدداً.'
  }
  if (message.includes('same password')) {
    return 'كلمة المرور الجديدة يجب أن تختلف عن القديمة.'
  }
  return 'حدث خطأ. يرجى المحاولة مجدداً.'
}
