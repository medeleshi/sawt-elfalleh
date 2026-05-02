'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  updateProfileSchema,
  UpdateProfileInput,
  updateNotificationSettingsSchema,
  UpdateNotificationSettingsInput,
} from '@/lib/validators/profile.schema'
import type { ActionResult } from '@/types/domain'

// ─────────────────────────────────────────
// Update Profile Action
// ─────────────────────────────────────────
export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { activity_ids, followed_region_ids, ...profileData } = parsed.data

  // Update profile fields
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      bio: profileData.bio ?? null,
      region_id: profileData.region_id ?? null,
      city: profileData.city ?? null,
      phone: profileData.phone ?? null,
      show_phone: profileData.show_phone ?? true,
      avatar_url: profileData.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return { success: false, error: 'حدث خطأ أثناء تحديث الملف الشخصي' }
  }

  // Update activities if provided
  if (activity_ids !== undefined) {
    // Delete all existing activities — error checked to prevent silent partial updates
    const { error: deleteActError } = await supabase.from('user_activities').delete().eq('user_id', user.id)
    if (deleteActError) {
      return { success: false, error: 'تعذّر تحديث الأنشطة' }
    }

    // Insert new ones
    if (activity_ids.length > 0) {
      const { error: actError } = await supabase.from('user_activities').insert(
        activity_ids.map((category_id) => ({
          user_id: user.id,
          category_id,
        }))
      )
      if (actError) {
        return { success: false, error: actError.message }
      }
    }
  }

  // Update followed regions if provided
  if (followed_region_ids !== undefined) {
    // Delete all existing followed regions — error checked to prevent silent partial updates
    const { error: deleteRegError } = await supabase
      .from('user_followed_regions')
      .delete()
      .eq('user_id', user.id)
    if (deleteRegError) {
      return { success: false, error: 'تعذّر تحديث الولايات' }
    }

    if (followed_region_ids.length > 0) {
      const { error: regError } = await supabase
        .from('user_followed_regions')
        .insert(
          followed_region_ids.map((region_id) => ({
            user_id: user.id,
            region_id,
          }))
        )
      if (regError) {
        return { success: false, error: regError.message }
      }
    }
  }

  revalidatePath('/profile/me')
  revalidatePath('/settings/profile')

  return { success: true }
}

// ─────────────────────────────────────────
// Toggle Phone Visibility Action
// ─────────────────────────────────────────
export async function togglePhoneVisibilityAction(
  show_phone: boolean
): Promise<ActionResult> {
  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      show_phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Phone visibility update error:', error)
    return { success: false, error: 'حدث خطأ أثناء تحديث خصوصية الهاتف' }
  }

  revalidatePath('/settings/profile')
  revalidatePath('/profile/me')

  return { success: true }
}

// ─────────────────────────────────────────
// Update Notification Settings Action
// ─────────────────────────────────────────
export async function updateNotificationSettingsAction(
  input: UpdateNotificationSettingsInput
): Promise<ActionResult> {
  const parsed = updateNotificationSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'بيانات غير صالحة' }
  }

  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase
    .from('notification_settings')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء حفظ إعدادات الإشعارات' }
  }

  revalidatePath('/settings')
  return { success: true }
}
