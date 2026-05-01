'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/domain'
import { logAdminAction } from '@/lib/actions/admin-logs'

// ─── Admin guard ──────────────────────────────────────────────────────────────

async function getAdminClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null, adminId: null }

  const { data: profile } = await (supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any)

  if (profile?.role !== 'admin') return { supabase: null, adminId: null }
  return { supabase: supabase as any, adminId: user.id }
}

// ─── Category Actions ─────────────────────────────────────────────────────────

const categorySchema = z.object({
  name_ar: z.string().min(2, 'اسم الصنف مطلوب').max(100),
  name_fr: z.string().max(100).optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'الـ slug يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط'),
  icon: z.string().max(10).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
})

export async function createCategoryAction(
  input: z.infer<typeof categorySchema>
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { data, error } = await supabase.from('categories').insert({
    ...parsed.data,
    is_active: true,
  }).select('id').single()

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'create_category', 'category', (data as any).id, parsed.data)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategoryAction(
  id: string,
  input: Partial<z.infer<typeof categorySchema>> & { is_active?: boolean }
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const updateSchema = categorySchema.partial().extend({ is_active: z.boolean().optional() })
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase
    .from('categories')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'update_category', 'category', id, input)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'delete_category', 'category', id)

  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── Unit Actions ─────────────────────────────────────────────────────────────

const unitSchema = z.object({
  name_ar: z.string().min(2, 'اسم المقياس مطلوب').max(50),
  name_fr: z.string().max(50).optional().nullable(),
  symbol: z.string().min(1, 'الرمز مطلوب').max(20),
  sort_order: z.number().int().min(0).optional(),
})

export async function createUnitAction(
  input: z.infer<typeof unitSchema>
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const parsed = unitSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { data, error } = await supabase.from('units').insert(parsed.data).select('id').single()
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'create_unit', 'unit', (data as any).id, parsed.data)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateUnitAction(
  id: string,
  input: Partial<z.infer<typeof unitSchema>>
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const parsed = unitSchema.partial().safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.from('units').update(parsed.data).eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'update_unit', 'unit', id, parsed.data)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteUnitAction(id: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'delete_unit', 'unit', id)

  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── Region Actions ───────────────────────────────────────────────────────────

const regionSchema = z.object({
  name_ar: z.string().min(2, 'اسم الولاية مطلوب').max(100),
  name_fr: z.string().max(100).optional().nullable(),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  sort_order: z.number().int().min(0).optional(),
})

export async function createRegionAction(
  input: z.infer<typeof regionSchema>
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const parsed = regionSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { data, error } = await supabase.from('regions').insert(parsed.data).select('id').single()
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'create_region', null, (data as any).id, parsed.data)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateRegionAction(
  id: string,
  input: Partial<z.infer<typeof regionSchema>>
): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const parsed = regionSchema.partial().safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.from('regions').update(parsed.data).eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'update_region', null, id, parsed.data)

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteRegionAction(id: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('regions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'delete_region', null, id)

  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── User Admin Actions ───────────────────────────────────────────────────────

/**
 * Permanently bans a user by setting deleted_at.
 * This is a hard ban — use restoreUserAction to reverse it.
 * Previously misnamed suspendUserAction; renamed for clarity.
 */
export async function banUserAction(userId: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'ban_user', 'user', userId)

  revalidatePath('/admin/users')
  return { success: true }
}

/** @deprecated Use banUserAction instead */
export const suspendUserAction = banUserAction

export async function restoreUserAction(userId: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'restore_user', 'user', userId)

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Post Admin Actions ───────────────────────────────────────────────────────

export async function manuallyExpirePostAction(postId: string): Promise<ActionResult> {
  const { supabase, adminId } = await getAdminClient()
  if (!supabase || !adminId) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase
    .from('posts')
    .update({
      status: 'expired',
      expires_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, adminId, 'expire_post', 'post', postId)

  revalidatePath('/marketplace')
  revalidatePath(`/marketplace/${postId}`)
  return { success: true }
}
