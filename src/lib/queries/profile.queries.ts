import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────
// Get public profile by username
// ─────────────────────────────────────────
export async function getProfileByUsername(username: string) {
  const supabase = (await createClient()) as any

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      avatar_url,
      role,
      bio,
      city,
      show_phone,
      phone,
      created_at,
      region_id,
      regions:region_id ( name_ar )
    `
    )
    .eq('username', username)
    .is('deleted_at', null)
    .single()

  if (error || !profile) return null
  return profile
}

// ─────────────────────────────────────────
// Get public posts by user_id
// ─────────────────────────────────────────
export async function getUserPosts(userId: string) {
  const supabase = (await createClient()) as any

  const { data: posts } = await supabase
    .from('posts')
    .select(
      `
      id,
      type,
      title,
      price,
      is_negotiable,
      quantity,
      status,
      created_at,
      city,
      region_id,
      regions:region_id ( name_ar ),
      categories:category_id ( name_ar, icon ),
      units:unit_id ( symbol ),
      post_images ( url, sort_order )
    `
    )
    .eq('user_id', userId)
    .in('status', ['active', 'expired'])
    .order('created_at', { ascending: false })
    .limit(50)

  return posts ?? []
}

// ─────────────────────────────────────────
// Get my full profile (authenticated)
// ─────────────────────────────────────────
export async function getMyProfile(userId: string) {
  const supabase = (await createClient()) as any

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      avatar_url,
      role,
      bio,
      city,
      phone,
      show_phone,
      region_id,
      is_profile_completed,
      created_at,
      regions:region_id ( name_ar, id )
    `
    )
    .eq('id', userId)
    .single()

  return profile
}

// ─────────────────────────────────────────
// Get saved posts for my profile
// ─────────────────────────────────────────
export async function getMySavedPosts(userId: string) {
  const supabase = (await createClient()) as any

  const { data } = await supabase
    .from('saved_posts')
    .select(
      `
      id,
      created_at,
      posts (
        id,
        type,
        title,
        price,
        is_negotiable,
        quantity,
        status,
        created_at,
        city,
        regions:region_id ( name_ar ),
        categories:category_id ( name_ar, icon ),
        units:unit_id ( symbol ),
        post_images ( url, sort_order )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

// ─────────────────────────────────────────
// Get user activities (category_ids)
// ─────────────────────────────────────────
export async function getMyActivities(userId: string) {
  const supabase = (await createClient()) as any
  const { data } = await supabase
    .from('user_activities')
    .select('category_id')
    .eq('user_id', userId)
  return (data ?? []).map((a: any) => a.category_id)
}

// ─────────────────────────────────────────
// Get user followed regions
// ─────────────────────────────────────────
export async function getMyFollowedRegions(userId: string) {
  const supabase = (await createClient()) as any
  const { data } = await supabase
    .from('user_followed_regions')
    .select('region_id')
    .eq('user_id', userId)
  return (data ?? []).map((r: any) => r.region_id)
}

// ─────────────────────────────────────────
// Get notification settings
// ─────────────────────────────────────────
export async function getNotificationSettings(userId: string) {
  const supabase = (await createClient()) as any
  const { data } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

// ─────────────────────────────────────────
// Count user post stats
// ─────────────────────────────────────────
export async function getUserPostStats(userId: string) {
  const supabase = (await createClient()) as any

  const { count: total } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: active } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  return { total: total ?? 0, active: active ?? 0 }
}
