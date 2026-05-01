'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/domain'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const reportPostSchema = z.object({
  post_id: z.string().uuid('معرّف المنشور غير صالح'),
  reason: z
    .string()
    .min(5, 'سبب البلاغ يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'سبب البلاغ لا يمكن أن يتجاوز 500 حرف'),
})

const reportUserSchema = z.object({
  reported_user_id: z.string().uuid('معرّف المستخدم غير صالح'),
  reason: z
    .string()
    .min(5, 'سبب البلاغ يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'سبب البلاغ لا يمكن أن يتجاوز 500 حرف'),
})

// ─── Report a Post ────────────────────────────────────────────────────────────

export async function reportPostAction(input: {
  post_id: string
  reason: string
}): Promise<ActionResult> {
  const parsed = reportPostSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Check not reporting own post
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', parsed.data.post_id)
    .single()

  if (post?.user_id === user.id) {
    return { success: false, error: 'لا يمكنك الإبلاغ عن منشورك الخاص' }
  }

  // Check for existing report to prevent spam
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('post_id', parsed.data.post_id)
    .single()

  if (existing) {
    return { success: false, error: 'لقد أبلغت عن هذا المنشور مسبقاً' }
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: parsed.data.post_id,
    reason: parsed.data.reason,
    status: 'pending',
  })

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إرسال البلاغ' }
  }

  return { success: true }
}

// ─── Report a User ────────────────────────────────────────────────────────────

export async function reportUserAction(input: {
  reported_user_id: string
  reason: string
}): Promise<ActionResult> {
  const parsed = reportUserSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  if (parsed.data.reported_user_id === user.id) {
    return { success: false, error: 'لا يمكنك الإبلاغ عن نفسك' }
  }

  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('reported_user_id', parsed.data.reported_user_id)
    .single()

  if (existing) {
    return { success: false, error: 'لقد أبلغت عن هذا المستخدم مسبقاً' }
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: parsed.data.reported_user_id,
    reason: parsed.data.reason,
    status: 'pending',
  })

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إرسال البلاغ' }
  }

  return { success: true }
}

// ─── Admin Actions ────────────────────────────────────────────────────────────

async function verifyAdmin() {
  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null, ok: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { supabase: null, ok: false }
  return { supabase, ok: true }
}

export async function updateReportStatusAction(input: {
  report_id: string
  status: 'reviewed' | 'dismissed'
  admin_note?: string
}): Promise<ActionResult> {
  const { supabase, ok } = await verifyAdmin()
  if (!ok || !supabase) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase
    .from('reports')
    .update({
      status: input.status,
      admin_note: input.admin_note ?? null,
    })
    .eq('id', input.report_id)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تحديث البلاغ' }
  }

  revalidatePath('/admin/reports')
  return { success: true }
}

export async function suspendPostAction(postId: string): Promise<ActionResult> {
  const { supabase, ok } = await verifyAdmin()
  if (!ok || !supabase) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'suspended' })
    .eq('id', postId)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إيقاف المنشور' }
  }

  revalidatePath('/admin/posts')
  revalidatePath('/admin/reports')
  return { success: true }
}

export async function restorePostAction(postId: string): Promise<ActionResult> {
  const { supabase, ok } = await verifyAdmin()
  if (!ok || !supabase) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'active' })
    .eq('id', postId)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء استعادة المنشور' }
  }

  revalidatePath('/admin/posts')
  return { success: true }
}

export async function deletePostAdminAction(
  postId: string
): Promise<ActionResult> {
  const { supabase, ok } = await verifyAdmin()
  if (!ok || !supabase) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء حذف المنشور' }
  }

  revalidatePath('/admin/posts')
  return { success: true }
}
