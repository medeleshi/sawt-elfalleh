'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { postSchema, postImageItemSchema } from '@/lib/validators/post.schema'
import { ROUTES, POST_EXPIRY_DAYS, STORAGE_BUCKETS } from '@/lib/utils/constants'
import type { ActionResult } from '@/types/domain'
import { sendNotification, sendNotificationBulk } from '@/lib/actions/send-notification'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Supabase returns 1-to-1 joined rows as an array when joining from the parent.
 * This normalises `notification_settings` so callers always get a plain object.
 */
function normalizeSettings(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null
  if (Array.isArray(raw)) return (raw[0] as Record<string, unknown>) ?? null
  return raw as Record<string, unknown>
}

/** Verify the caller is authenticated and return their profile. */
async function getAuthedProfile() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { supabase, user: null, profile: null }

  const { data: profile } = await (supabase
    .from('profiles')
    .select('id, role, is_profile_completed')
    .eq('id', user.id)
    .single() as any)

  return { supabase, user, profile }
}

/** Parse the images JSON field from FormData. */
function parseImages(raw: FormDataEntryValue | null) {
  if (!raw || raw === '') return []
  try {
    const parsed = JSON.parse(raw as string)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item => {
      const result = postImageItemSchema.safeParse(item)
      return result.success
    })
  } catch {
    return []
  }
}

// ─── Create Post ──────────────────────────────────────────────────────────────

export async function createPostAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getAuthedProfile()

  if (!user || !profile) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  if (!profile.is_profile_completed) {
    return { success: false, error: 'يجب إكمال ملفك الشخصي أولاً' }
  }

  // Parse raw fields
  const raw = {
    type: formData.get('type'),
    category_id: formData.get('category_id'),
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    quantity: formData.get('quantity'),
    unit_id: formData.get('unit_id'),
    price: formData.get('price'),
    is_negotiable: formData.get('is_negotiable') === 'true',
    region_id: formData.get('region_id'),
    city: formData.get('city') ?? '',
    images: formData.get('images') ?? '',
  }

  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const data = parsed.data

  // Citizen cannot create sell posts — guard even if UI already hides it
  if (profile.role === 'citizen' && data.type === 'sell') {
    return { success: false, error: 'المواطن لا يمكنه نشر إعلانات بيع' }
  }

  // Calculate expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + POST_EXPIRY_DAYS)

  // Insert post
  const { data: post, error: postError } = await ((supabase.from('posts') as any)
    .insert({
      user_id: user.id,
      type: data.type,
      category_id: data.category_id,
      title: data.title,
      description: data.description || null,
      quantity: data.quantity,
      unit_id: data.unit_id,
      price: data.price,
      is_negotiable: data.is_negotiable,
      region_id: data.region_id,
      city: data.city || null,
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single() as any)

  if (postError || !post) {
    return { success: false, error: 'حدث خطأ أثناء نشر الإعلان' }
  }

  // Insert post images
  const images = parseImages(formData.get('images'))
  if (images.length > 0) {
    const imageRows = images.map((img: any, idx: number) => ({
      post_id: post.id,
      url: img.url,
      storage_path: img.storage_path,
      sort_order: idx,
    }))

    const { error: imgError } = await (supabase
      .from('post_images')
      .insert(imageRows as any) as any)

    if (imgError) {
      // Post created successfully; image insert failed — non-fatal, log and continue
      console.error('[createPostAction] image insert error:', imgError)
    }
  }

  // ─── Fan-out: notify users interested in this post ──────────────────────────
  try {
    const postCategoryId = data.category_id
    const postRegionId   = data.region_id

    // 1) Users whose HOME region matches the post region
    // notification_settings is 1-to-1 with profiles, but Supabase embeds it as an
    // array when joining from the parent side — access index [0] to read the object.
    const { data: regionFollowers } = await (supabase
      .from('profiles')
      .select('id, notification_settings(new_post_region)')
      .eq('region_id', postRegionId)
      .neq('id', user.id) as any)

    const regionNotifs = (regionFollowers ?? [])
      .filter((p: any) => {
        const s = normalizeSettings(p.notification_settings)
        return s?.new_post_region !== false
      })
      .map((p: any) => ({
        userId: p.id,
        type: 'new_post_region' as const,
        title: 'منشور جديد في ولايتك',
        body: data.title,
        data: { post_id: post.id, category_id: postCategoryId, region_id: postRegionId },
      }))

    // 2) Users who FOLLOW this post's region (different type so UI can differentiate)
    const { data: followedRegionUsers } = await (supabase
      .from('user_followed_regions')
      .select('user_id, profiles!inner(notification_settings(new_post_region))')
      .eq('region_id', postRegionId)
      .neq('user_id', user.id) as any)

    const followedRegionNotifs = (followedRegionUsers ?? [])
      .filter((r: any) => {
        const s = normalizeSettings(r.profiles?.notification_settings)
        return s?.new_post_region !== false
      })
      .map((r: any) => ({
        userId: r.user_id,
        type: 'new_post_followed_region' as const,
        title: 'منشور جديد في ولاية تتابعها',
        body: data.title,
        data: { post_id: post.id, category_id: postCategoryId, region_id: postRegionId },
      }))

    // 3) Users whose activity matches this post's category
    const { data: activityUsers } = await (supabase
      .from('user_activities')
      .select('user_id, profiles!inner(notification_settings(new_post_activity))')
      .eq('category_id', postCategoryId)
      .neq('user_id', user.id) as any)

    const activityNotifs = (activityUsers ?? [])
      .filter((a: any) => {
        const s = normalizeSettings(a.profiles?.notification_settings)
        return s?.new_post_activity !== false
      })
      .map((a: any) => ({
        userId: a.user_id,
        type: 'new_post_activity' as const,
        title: 'منشور يناسب نشاطك',
        body: data.title,
        data: { post_id: post.id, category_id: postCategoryId, region_id: postRegionId },
      }))

    // Deduplicate: a user might appear in multiple buckets — keep first occurrence
    const seen = new Set<string>()
    const allNotifs = [...regionNotifs, ...followedRegionNotifs, ...activityNotifs].filter((n) => {
      if (seen.has(n.userId)) return false
      seen.add(n.userId)
      return true
    })

    if (allNotifs.length > 0) {
      await sendNotificationBulk(supabase as any, allNotifs)
    }
  } catch (err) {
    // Fan-out failure must never block post creation
    console.error('[createPostAction] fan-out notification error:', err)
  }
  // ─────────────────────────────────────────────────────────────────────────────

  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.MARKETPLACE)
  revalidatePath(ROUTES.PROFILE_ME)

  redirect(`/marketplace/${post.id}`)
}

// ─── Update Post ──────────────────────────────────────────────────────────────

export async function updatePostAction(
  postId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getAuthedProfile()

  if (!user || !profile) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Verify ownership
  const { data: existingPost, error: fetchError } = await ((supabase.from('posts') as any)
    .select('id, user_id, status')
    .eq('id', postId)
    .single() as any)

  if (fetchError || !existingPost) {
    return { success: false, error: 'الإعلان غير موجود' }
  }

  if (existingPost.user_id !== user.id) {
    return { success: false, error: 'لا يمكنك تعديل هذا الإعلان' }
  }

  if (existingPost.status === 'deleted' || existingPost.status === 'suspended') {
    return { success: false, error: 'لا يمكن تعديل هذا الإعلان' }
  }

  // Parse fields
  const raw = {
    type: formData.get('type'),
    category_id: formData.get('category_id'),
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    quantity: formData.get('quantity'),
    unit_id: formData.get('unit_id'),
    price: formData.get('price'),
    is_negotiable: formData.get('is_negotiable') === 'true',
    region_id: formData.get('region_id'),
    city: formData.get('city') ?? '',
    images: formData.get('images') ?? '',
  }

  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const data = parsed.data

  if (profile.role === 'citizen' && data.type === 'sell') {
    return { success: false, error: 'المواطن لا يمكنه نشر إعلانات بيع' }
  }

  // Update post
  const { error: updateError } = await ((supabase.from('posts') as any)
    .update({
      type: data.type,
      category_id: data.category_id,
      title: data.title,
      description: data.description || null,
      quantity: data.quantity,
      unit_id: data.unit_id,
      price: data.price,
      is_negotiable: data.is_negotiable,
      region_id: data.region_id,
      city: data.city || null,
    })
    .eq('id', postId)
    .eq('user_id', user.id) as any) // double-check ownership at DB level

  if (updateError) {
    return { success: false, error: 'حدث خطأ أثناء تحديث الإعلان' }
  }

  // Replace images: delete existing, insert new
  const images = parseImages(formData.get('images'))

  // Delete old image records (Storage files already managed client-side)
  const { error: deleteImgError } = await supabase.from('post_images').delete().eq('post_id', postId)
  if (deleteImgError) {
    console.error('[updatePostAction] image delete error:', deleteImgError)
    return { success: false, error: 'حدث خطأ أثناء تحديث صور الإعلان' }
  }

  if (images.length > 0) {
    const imageRows = images.map((img: any, idx: number) => ({
      post_id: postId,
      url: img.url,
      storage_path: img.storage_path,
      sort_order: idx,
    }))

    const { error: imgError } = await (supabase
      .from('post_images')
      .insert(imageRows as any) as any)

    if (imgError) {
      console.error('[updatePostAction] image insert error:', imgError)
    }
  }

  revalidatePath(`/marketplace/${postId}`)
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.MARKETPLACE)
  revalidatePath(ROUTES.PROFILE_ME)

  redirect(`/marketplace/${postId}`)
}

// ─── Delete Post ──────────────────────────────────────────────────────────────

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedProfile()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Fetch image storage paths BEFORE soft-deleting so future RLS policies
  // on deleted posts cannot block the read and cause storage leaks.
  const { data: images } = await supabase
    .from('post_images')
    .select('storage_path')
    .eq('post_id', postId)

  // Soft delete — set status = deleted
  const { error } = await ((supabase.from('posts') as any)
    .update({ status: 'deleted' })
    .eq('id', postId)
    .eq('user_id', user.id) as any) // RLS enforces this too

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء حذف الإعلان' }
  }

  // Clean up storage files now that the soft-delete succeeded.
  if (images && images.length > 0) {
    const paths = (images as any[]).map(img => img.storage_path).filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabase.storage.from('post-images').remove(paths)
    }
  }

  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.MARKETPLACE)
  revalidatePath(ROUTES.PROFILE_ME)

  return { success: true }
}

// ─── Get post for editing (server helper) ─────────────────────────────────────

export async function getPostForEdit(postId: string) {
  const { supabase, user } = await getAuthedProfile()
  if (!user) return null

  const { data } = await supabase
    .from('posts')
    .select(`
      id,
      type,
      category_id,
      title,
      description,
      quantity,
      unit_id,
      price,
      is_negotiable,
      region_id,
      city,
      status,
      user_id,
      post_images (
        id,
        url,
        storage_path,
        sort_order
      )
    `)
    .eq('id', postId)
    .eq('user_id', user.id)
    .single()

  return data ?? null
}

// ─── Save / Unsave Post ───────────────────────────────────────────────────────

export async function toggleSavePostAction(postId: string): Promise<ActionResult<{ isSaved: boolean }>> {
  const { supabase, user } = await getAuthedProfile()

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' }
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)

    if (error) return { success: false, error: 'حدث خطأ أثناء إلغاء الحفظ' }

    revalidatePath(ROUTES.PROFILE_ME)
    return { success: true, data: { isSaved: false } }
  } else {
    // Save
    const { error } = await (supabase
      .from('saved_posts') as any)
      .insert({ user_id: user.id, post_id: postId })

    if (error) return { success: false, error: 'حدث خطأ أثناء حفظ الإعلان' }

    // Notify the post owner (non-blocking)
    try {
      const { data: savedPost } = await (supabase
        .from('posts')
        .select('user_id, title')
        .eq('id', postId)
        .single() as any)

      const ownerId = savedPost?.user_id

      if (ownerId && ownerId !== user.id) {
        // Check owner's notification preferences
        const { data: notifSettings } = await (supabase
          .from('notification_settings')
          .select('post_saved')
          .eq('user_id', ownerId)
          .maybeSingle() as any)

        // Respect the `post_saved` preference (defaults to enabled if row absent)
        const notifyEnabled = !notifSettings || notifSettings.post_saved !== false

        if (notifyEnabled) {
          await sendNotification(supabase as any, {
            userId: ownerId,
            type: 'post_saved',
            title: 'أضاف شخص ما إعلانك إلى المحفوظات',
            body: savedPost?.title
              ? `قام شخص ما بحفظ إعلانك "${savedPost.title}".`
              : 'قام شخص ما بحفظ أحد إعلاناتك.',
            data: { post_id: postId, saver_id: user.id },
          })
        }
      }
    } catch {
      // Notification is non-critical — ignore errors
    }

    revalidatePath(ROUTES.PROFILE_ME)
    return { success: true, data: { isSaved: true } }
  }
}
