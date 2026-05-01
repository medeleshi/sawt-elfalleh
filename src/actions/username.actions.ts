'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isForbiddenUsername, generateUniqueUsername } from '@/lib/utils/username'
import type { ActionResult } from '@/types/domain'

// ─── Schema ───────────────────────────────────────────────────────────────────

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  .max(30, 'اسم المستخدم لا يمكن أن يتجاوز 30 حرفاً')
  .regex(
    /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/,
    'اسم المستخدم يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط، ولا يبدأ أو ينتهي بشرطة'
  )

// ─── Update Username Action ───────────────────────────────────────────────────

/**
 * Allows the authenticated user to change their username.
 * Validates:
 *   - Format (lowercase Latin, digits, hyphens)
 *   - Not a forbidden system route name
 *   - Uniqueness against the database
 */
export async function updateUsernameAction(
  username: string
): Promise<ActionResult> {
  const parsed = usernameSchema.safeParse(username)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const slug = parsed.data

  if (isForbiddenUsername(slug)) {
    return { success: false, error: 'هذا الاسم محجوز ولا يمكن استخدامه' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Check uniqueness — exclude caller so they can "save" their current username
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', slug)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'اسم المستخدم هذا مأخوذ. يرجى اختيار اسم آخر.' }
  }

  const { error } = await supabase
    .from('profiles')
    // @ts-expect-error - db.ts generic inference limitation
    .update({ username: slug })
    .eq('id', user.id)

  if (error) {
    console.error('[updateUsernameAction] error:', error)
    return { success: false, error: 'حدث خطأ أثناء حفظ اسم المستخدم' }
  }

  revalidatePath('/settings')
  revalidatePath(`/profile/${slug}`)
  return { success: true }
}

// ─── Check Username Availability (lightweight, for live feedback) ─────────────

/**
 * Returns whether a username is available for the current user.
 * Intended for use in settings forms for real-time availability checks.
 */
export async function checkUsernameAvailabilityAction(
  username: string
): Promise<ActionResult<{ available: boolean; suggestion?: string }>> {
  const parsed = usernameSchema.safeParse(username)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const slug = parsed.data

  if (isForbiddenUsername(slug)) {
    return {
      success: true,
      data: { available: false },
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build the uniqueness query — exclude the caller's own row so they can
  // re-save their current username without a false "taken" result.
  // When unauthenticated, skip the exclusion entirely (no row to exclude).
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', slug)

  if (user) {
    query = query.neq('id', user.id)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    // Provide a suggestion
    const suggestion = await generateUniqueUsername(slug, user?.id)
    return {
      success: true,
      data: { available: false, suggestion },
    }
  }

  return { success: true, data: { available: true } }
}
