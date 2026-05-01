'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/domain'
import { logAdminAction } from '@/lib/actions/admin-logs'
import { sendNotification } from '@/lib/actions/send-notification'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

// ─── Schemas ──────────────────────────────────────────────────────────────────

const reportPostSchema = z.object({
  post_id: z.string().uuid('معرّف المنشور غير صالح'),
  reason: z
    .string()
    .trim()
    .min(5, 'سبب البلاغ يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'سبب البلاغ لا يمكن أن يتجاوز 500 حرف'),
})

const reportUserSchema = z.object({
  reported_user_id: z.string().uuid('معرّف المستخدم غير صالح'),
  reason: z
    .string()
    .trim()
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Check not reporting own post
  const { data: post } = await ((supabase.from('posts') as any)
    .select('user_id')
    .eq('id', parsed.data.post_id)
    .maybeSingle() as any)

  if (post?.user_id === user.id) {
    return { success: false, error: 'لا يمكنك الإبلاغ عن منشورك الخاص' }
  }

  // Check for existing report to prevent spam
  const { data: existing } = await ((supabase.from('reports') as any)
    .select('id')
    .eq('reporter_id', user.id)
    .eq('post_id', parsed.data.post_id)
    .maybeSingle() as any)

  if (existing) {
    return { success: false, error: 'لقد أبلغت عن هذا المنشور مسبقاً' }
  }

  const { error } = await ((supabase.from('reports') as any).insert({
    reporter_id: user.id,
    post_id: parsed.data.post_id,
    reason: parsed.data.reason,
  }) as any)

  if (error) {
    console.error('[reportPostAction] Database error:', error)
    return { success: false, error: 'حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.' }
  }

  revalidatePath('/admin/reports')
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  if (parsed.data.reported_user_id === user.id) {
    return { success: false, error: 'لا يمكنك الإبلاغ عن نفسك' }
  }

  const { data: existing } = await ((supabase.from('reports') as any)
    .select('id')
    .eq('reporter_id', user.id)
    .eq('reported_user_id', parsed.data.reported_user_id)
    .maybeSingle() as any)

  if (existing) {
    return { success: false, error: 'لقد أبلغت عن هذا المستخدم مسبقاً' }
  }

  const { error } = await ((supabase.from('reports') as any).insert({
    reporter_id: user.id,
    reported_user_id: parsed.data.reported_user_id,
    reason: parsed.data.reason,
  }) as any)

  if (error) {
    console.error('[reportUserAction] Database error:', error)
    return { success: false, error: 'حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.' }
  }

  revalidatePath('/admin/reports')
  return { success: true }
}

// ─── Admin Actions ────────────────────────────────────────────────────────────

async function verifyAdmin(): Promise<{
  supabase: SupabaseServerClient | null
  ok: boolean
  adminId: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null, ok: false, adminId: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile as { role: string }).role !== 'admin') {
    return { supabase: null, ok: false, adminId: null }
  }
  return { supabase, ok: true, adminId: user.id }
}

export async function updateReportStatusAction(input: {
  report_id: string
  status: 'reviewed' | 'dismissed'
  admin_note?: string
}): Promise<ActionResult> {
  const { supabase, ok, adminId } = await verifyAdmin()
  if (!ok || !supabase || !adminId) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  // Fetch reporter BEFORE the update so their data is always available regardless of
  // any future RLS changes that might hide reviewed/dismissed reports
  const { data: report } = await ((supabase
    .from('reports') as any)
    .select('reporter_id')
    .eq('id', input.report_id)
    .maybeSingle() as any)

  const { error } = await ((supabase
    .from('reports') as any)
    .update({
      status: input.status,
      admin_note: input.admin_note || null,
    })
    .eq('id', input.report_id) as any)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تحديث البلاغ' }
  }

  // @ts-expect-error - db.ts generic inference limitation
  await logAdminAction(supabase, adminId, 'update_report_status', 'report', input.report_id, input)

  if (report?.reporter_id) {
    const isReviewed = input.status === 'reviewed'
    await sendNotification(supabase as any, {
      userId: report.reporter_id,
      type: isReviewed ? 'report_reviewed' : 'report_dismissed',
      title: isReviewed ? 'تمت مراجعة بلاغك' : 'تم رفض بلاغك',
      body: isReviewed
        ? 'شكراً لمساهمتك. تمت مراجعة بلاغك واتخاذ الإجراء المناسب.'
        : 'تمت مراجعة بلاغك وقررت الإدارة عدم اتخاذ إجراء في الوقت الحالي.',
      data: { report_id: input.report_id },
    })
  }

  revalidatePath('/admin/reports')
  return { success: true }
}

export async function suspendPostAction(postId: string): Promise<ActionResult> {
  const { supabase, ok, adminId } = await verifyAdmin()
  if (!ok || !supabase || !adminId) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  // Fetch owner data BEFORE the update so RLS on suspended posts cannot block the read
  const { data: targetPost } = await ((supabase
    .from('posts') as any)
    .select('user_id, title')
    .eq('id', postId)
    .maybeSingle() as any)

  const { error } = await ((supabase
    .from('posts') as any)
    .update({ status: 'suspended' })
    .eq('id', postId) as any)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إيقاف المنشور' }
  }

  // @ts-expect-error - db.ts generic inference limitation
  await logAdminAction(supabase, adminId, 'suspend_post', 'post', postId)

  if (targetPost?.user_id) {
    await sendNotification(supabase as any, {
      userId: targetPost.user_id,
      type: 'post_suspended',
      title: 'تم إيقاف إعلانك',
      body: targetPost.title
        ? `تم إيقاف إعلانك "${targetPost.title}" من قِبَل الإدارة بسبب مخالفة سياسة الاستخدام.`
        : 'تم إيقاف أحد إعلاناتك من قِبَل الإدارة.',
      data: { post_id: postId, admin_id: adminId },
    })
  }

  revalidatePath('/admin/posts')
  revalidatePath('/admin/reports')
  return { success: true }
}

export async function restorePostAction(postId: string): Promise<ActionResult> {
  const { supabase, ok, adminId } = await verifyAdmin()
  if (!ok || !supabase || !adminId) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  // Fetch owner data BEFORE the update to guarantee data is available post-status-change
  const { data: restoredPost } = await ((supabase
    .from('posts') as any)
    .select('user_id, title')
    .eq('id', postId)
    .maybeSingle() as any)

  const { error } = await ((supabase
    .from('posts') as any)
    .update({ status: 'active' })
    .eq('id', postId) as any)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء استعادة المنشور' }
  }

  // @ts-expect-error - db.ts generic inference limitation
  await logAdminAction(supabase, adminId, 'restore_post', 'post', postId)

  if (restoredPost?.user_id) {
    await sendNotification(supabase as any, {
      userId: restoredPost.user_id,
      type: 'post_restored',
      title: 'تمت استعادة إعلانك',
      body: restoredPost.title
        ? `تمت استعادة إعلانك "${restoredPost.title}" وأصبح مرئياً مجدداً.`
        : 'تمت استعادة أحد إعلاناتك وأصبح مرئياً مجدداً.',
      data: { post_id: postId, admin_id: adminId },
    })
  }

  revalidatePath('/admin/posts')
  return { success: true }
}

export async function deletePostAdminAction(
  postId: string
): Promise<ActionResult> {
  const { supabase, ok, adminId } = await verifyAdmin()
  if (!ok || !supabase || !adminId) {
    return { success: false, error: 'غير مصرح لك بهذا الإجراء' }
  }

  const { error } = await ((supabase.from('posts') as any).delete().eq('id', postId) as any)

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء حذف المنشور' }
  }

  // @ts-expect-error - db.ts generic inference limitation
  await logAdminAction(supabase, adminId, 'delete_post', 'post', postId)

  revalidatePath('/admin/posts')
  revalidatePath('/admin/reports')
  return { success: true }
}
