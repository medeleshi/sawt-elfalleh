'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/domain'

// ─── Admin guard ──────────────────────────────────────────────────────────────

async function getAdminClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null }

  const { data: profile } = await (supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any)

  if (profile?.role !== 'admin') return { supabase: null }
  return { supabase: supabase as any }
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
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.from('categories').insert({
    ...parsed.data,
    is_active: true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategoryAction(
  id: string,
  input: Partial<z.infer<typeof categorySchema>> & { is_active?: boolean }
): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

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
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const parsed = unitSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.from('units').insert(parsed.data)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateUnitAction(
  id: string,
  input: Partial<z.infer<typeof unitSchema>>
): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('units').update(input).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteUnitAction(id: string): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

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
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const parsed = regionSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.from('regions').insert(parsed.data)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateRegionAction(
  id: string,
  input: Partial<z.infer<typeof regionSchema>>
): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase.from('regions').update(input).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── User Admin Actions ───────────────────────────────────────────────────────

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  // Soft-delete by setting deleted_at
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function restoreUserAction(userId: string): Promise<ActionResult> {
  const { supabase } = await getAdminClient()
  if (!supabase) return { success: false, error: 'غير مصرح لك' }

  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
