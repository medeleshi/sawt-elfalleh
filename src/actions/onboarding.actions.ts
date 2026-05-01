'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  onboardingProfileSchema,
  onboardingInterestsSchema,
} from '@/lib/validators/onboarding.schema'
import { ROUTES } from '@/lib/utils/constants'
import { validateImage, generateStoragePath } from '@/lib/utils/storage'
import { generateUniqueUsername } from '@/lib/utils/username'
import type { ActionResult } from '@/types/domain'

// ─── Step 1: Save profile ─────────────────────────────────────────────────────

/**
 * Saves profile data (step 1).
 * Auto-generates a unique username from full_name if not already set.
 * Does NOT set is_profile_completed = true — that only happens in step 3.
 * On success: redirects to /onboarding/interests.
 */
export async function saveProfileAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    full_name: formData.get('full_name') ?? '',
    role:      formData.get('role') ?? '',
    region_id: formData.get('region_id') ?? '',
    city:      formData.get('city')  ?? '',
    phone:     formData.get('phone') ?? '',
    bio:       formData.get('bio')   ?? '',
  }

  const parsed = onboardingProfileSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً.' }
  }

  // ── Handle Avatar Upload ──
  let avatarUrl = formData.get('avatar_url') as string | null
  const avatarFile = formData.get('avatar') as File | null

  if (avatarFile && avatarFile.size > 0) {
    const { valid, error: validationError } = validateImage(avatarFile)
    if (!valid) return { success: false, error: validationError || 'ملف غير صالح' }

    const filePath = generateStoragePath(avatarFile, { bucket: 'avatars', folder: user.id })

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      console.error('[saveProfileAction] Upload Error:', uploadError)
      return { success: false, error: `تعذّر رفع الصورة: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    avatarUrl = publicUrl
  }

  // ── Auto-generate username if not already set ─────────────────────────────
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  let username: string | undefined
  // @ts-expect-error - db.ts generic inference limitation
  if (!existingProfile?.username) {
    username = await generateUniqueUsername(parsed.data.full_name, user.id)
  }

  // ── Build update payload ──────────────────────────────────────────────────
  const updatePayload: Record<string, unknown> = {
    id:        user.id,
    full_name: parsed.data.full_name,
    role:      parsed.data.role,
    region_id: parsed.data.region_id,
    show_phone: true,
    is_profile_completed: false,
  }

  if (username)          updatePayload.username  = username
  if (avatarUrl)         updatePayload.avatar_url = avatarUrl
  if (parsed.data.city)  updatePayload.city       = parsed.data.city
  if (parsed.data.phone) updatePayload.phone      = parsed.data.phone
  if (parsed.data.bio)   updatePayload.bio        = parsed.data.bio

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert(updatePayload as any, { onConflict: 'id' })

  if (updateError) {
    console.error('[saveProfileAction] Update Error:', updateError)
    return { success: false, error: `تعذّر حفظ البيانات: ${updateError.message}` }
  }

  redirect(ROUTES.ONBOARDING_INTERESTS)
}

// ─── Step 2: Save interests ───────────────────────────────────────────────────

/**
 * Saves activities and followed regions (step 2).
 * Strategy: delete existing rows then insert fresh ones.
 * On success: redirects to /onboarding/done.
 */
export async function saveInterestsAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const activity_ids        = formData.getAll('activity_ids').map(String)
  const followed_region_ids = formData.getAll('followed_region_ids').map(String)

  const parsed = onboardingInterestsSchema.safeParse({
    activity_ids,
    followed_region_ids,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً.' }
  }

  // ── Activities ────────────────────────────────────────────────────────────
  const { error: deleteActivitiesError } = await supabase
    .from('user_activities')
    .delete()
    .eq('user_id', user.id)

  if (deleteActivitiesError) {
    return { success: false, error: 'تعذّر تحديث الأنشطة. يرجى المحاولة مجدداً.' }
  }

  if (parsed.data.activity_ids.length > 0) {
    const activityRows = parsed.data.activity_ids.map((category_id) => ({
      user_id: user.id,
      category_id,
    }))

    const { error: insertActivitiesError } = await supabase
      .from('user_activities')
      // @ts-expect-error - db.ts generic inference limitation
      .insert(activityRows)

    if (insertActivitiesError) {
      return {
        success: false,
        error: insertActivitiesError.message.includes('لا يمكنك')
          ? insertActivitiesError.message
          : 'تعذّر حفظ الأنشطة. يرجى المحاولة مجدداً.',
      }
    }
  }

  // ── Followed regions ──────────────────────────────────────────────────────
  const { error: deleteRegionsError } = await supabase
    .from('user_followed_regions')
    .delete()
    .eq('user_id', user.id)

  if (deleteRegionsError) {
    return { success: false, error: 'تعذّر تحديث الولايات. يرجى المحاولة مجدداً.' }
  }

  if (parsed.data.followed_region_ids.length > 0) {
    const regionRows = parsed.data.followed_region_ids.map((region_id) => ({
      user_id: user.id,
      region_id,
    }))

    const { error: insertRegionsError } = await supabase
      .from('user_followed_regions')
      // @ts-expect-error - db.ts generic inference limitation
      .insert(regionRows)

    if (insertRegionsError) {
      return {
        success: false,
        error: insertRegionsError.message.includes('لا يمكنك')
          ? insertRegionsError.message
          : 'تعذّر حفظ الولايات. يرجى المحاولة مجدداً.',
      }
    }
  }

  redirect(ROUTES.ONBOARDING_DONE)
}

// ─── Step 3: Complete onboarding ──────────────────────────────────────────────

/**
 * Sets is_profile_completed = true (step 3).
 * On success: redirects to home.
 */
export async function completeOnboardingAction(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً.' }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    // @ts-expect-error - db.ts generic inference limitation
    .update({ is_profile_completed: true })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: 'تعذّر إكمال الإعداد. يرجى المحاولة مجدداً.' }
  }

  redirect(ROUTES.HOME)
}
