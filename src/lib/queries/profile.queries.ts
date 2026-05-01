import { createClient } from '@/lib/supabase/server'

// ─── Get public profile by username or ID ────────────────────────────────────

export async function getProfileByUsername(identifier: string) {
  const supabase = await createClient()

  // Detect if identifier is a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

  let query = supabase
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

  if (isUuid) {
    query = query.eq('id', identifier)
  } else {
    query = query.eq('username', identifier)
  }

  const { data: profile, error } = await query
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !profile) return null
  return profile
}

// ─── Get public posts by user_id with pagination ──────────────────────────────

export async function getUserPosts(userId: string, page = 1, limit = 12) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data: posts, count } = await supabase
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
      region:region_id ( name_ar ),
      category:category_id ( name_ar, icon ),
      unit:unit_id ( symbol, name_ar ),
      post_images ( url, sort_order )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .in('status', ['active', 'expired'])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    posts: posts ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  }
}

// ─── Get my full profile (authenticated) ─────────────────────────────────────

export async function getMyProfile(userId: string) {
  const supabase = await createClient()

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
    .maybeSingle()

  return profile ?? null
}

// ─── Get saved posts for my profile with pagination ───────────────────────────

export async function getMySavedPosts(userId: string, page = 1, limit = 12) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, count } = await supabase
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
        region:region_id ( name_ar ),
        category:category_id ( name_ar, icon ),
        unit:unit_id ( symbol, name_ar ),
        post_images ( url, sort_order )
      )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    savedPosts: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  }
}

// ─── Get user activities (category_ids) ──────────────────────────────────────

export async function getMyActivities(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_activities')
    .select('category_id')
    .eq('user_id', userId)
  const activities = data as { category_id: string }[] | null
  return (activities ?? []).map((a) => a.category_id)
}

// ─── Get user followed regions ────────────────────────────────────────────────

export async function getMyFollowedRegions(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_followed_regions')
    .select('region_id')
    .eq('user_id', userId)
  const regions = data as { region_id: string }[] | null
  return (regions ?? []).map((r) => r.region_id)
}

// ─── Get notification settings ────────────────────────────────────────────────

export async function getNotificationSettings(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? null
}

// ─── Count user post stats ────────────────────────────────────────────────────

export async function getUserPostStats(userId: string) {
  const supabase = await createClient()

  const [{ count: total }, { count: active }] = await Promise.all([
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active'),
  ])

  return { total: total ?? 0, active: active ?? 0 }
}
