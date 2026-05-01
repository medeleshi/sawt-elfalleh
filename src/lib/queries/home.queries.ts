import { createClient } from '@/lib/supabase/server'
import { HOME_SECTION_LIMIT } from '@/lib/utils/constants'
import type { PostWithDetails } from '@/types/domain'

/**
 * Exact select string reused across all post queries.
 * Joins: profiles, categories, regions, units, post_images (sorted).
 * No select * — only required fields per coding rules.
 */
const POST_SELECT = `
  id,
  type,
  title,
  price,
  quantity,
  is_negotiable,
  region_id,
  city,
  status,
  created_at,
  profiles (
    id,
    full_name,
    username,
    avatar_url,
    phone,
    show_phone
  ),
  category:categories (
    id,
    name_ar,
    icon,
    slug
  ),
  region:regions (
    id,
    name_ar,
    code
  ),
  unit:units (
    id,
    name_ar,
    symbol
  ),
  post_images (
    id,
    url,
    sort_order
  )
` as const

// ─── User context ─────────────────────────────────────────────────────────────

interface UserContext {
  userId:            string
  regionId:          string | null
  activityCategoryIds: string[]
  followedRegionIds:   string[]
}

/**
 * Fetch the user's profile data needed to drive the home feed.
 * Single call per page render — results passed to each section query.
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const supabase = await createClient()

  // Fetch profile region
  const { data: profile } = await (supabase
    .from('profiles')
    .select('region_id')
    .eq('id', userId)
    .single() as any)

  // Fetch activity category ids
  const { data: activities } = await (supabase
    .from('user_activities')
    .select('category_id')
    .eq('user_id', userId) as any)

  // Fetch followed region ids
  const { data: followedRegions } = await (supabase
    .from('user_followed_regions')
    .select('region_id')
    .eq('user_id', userId) as any)

  return {
    userId,
    regionId:            profile?.region_id ?? null,
    activityCategoryIds: (activities ?? []).map((a: any) => a.category_id),
    followedRegionIds:   (followedRegions ?? []).map((r: any) => r.region_id),
  }
}

// ─── Section 1: My region posts ───────────────────────────────────────────────

/**
 * Active posts from the user's region.
 * Returns [] if user has no region set.
 */
export async function getMyRegionPosts(
  regionId: string | null
): Promise<PostWithDetails[]> {
  if (!regionId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .eq('region_id', regionId)
    .order('created_at', { ascending: false })
    .limit(HOME_SECTION_LIMIT)

  return (data as PostWithDetails[]) ?? []
}

// ─── Section 2: Activity matching posts ──────────────────────────────────────

/**
 * Active posts matching the user's activity categories.
 * Returns [] if user has no activities set.
 */
export async function getActivityPosts(
  categoryIds: string[]
): Promise<PostWithDetails[]> {
  if (categoryIds.length === 0) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false })
    .limit(HOME_SECTION_LIMIT)

  return (data as PostWithDetails[]) ?? []
}

// ─── Section 3: Latest posts ──────────────────────────────────────────────────

/**
 * Most recently created active posts — always shown regardless of profile data.
 */
export async function getLatestPosts(): Promise<PostWithDetails[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(HOME_SECTION_LIMIT)

  return (data as PostWithDetails[]) ?? []
}

// ─── Section 4: Followed regions posts ───────────────────────────────────────

/**
 * Active posts from regions the user follows.
 * Returns [] if user follows no regions.
 */
export async function getFollowedRegionPosts(
  followedRegionIds: string[]
): Promise<PostWithDetails[]> {
  if (followedRegionIds.length === 0) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .in('region_id', followedRegionIds)
    .order('created_at', { ascending: false })
    .limit(HOME_SECTION_LIMIT)

  return (data as PostWithDetails[]) ?? []
}

// ─── Unified Home Feed ───────────────────────────────────────────────────────

export interface HomeFeedData {
  regionPosts: PostWithDetails[]
  activityPosts: PostWithDetails[]
  followedRegionPosts: PostWithDetails[]
  latestPosts: PostWithDetails[]
}

/**
 * Fetches all home feed sections in parallel, ensures NO DUPLICATES across sections,
 * and fills any section having < 10 posts with latest posts (maintaining uniqueness).
 */
export async function getUnifiedHomeFeed(userId: string | null): Promise<HomeFeedData> {
  const context = userId ? await getUserContext(userId) : null
  
  // 1. Initial parallel fetch
  const [regionRaw, activityRaw, followedRaw, latestRaw] = await Promise.all([
    getMyRegionPosts(context?.regionId ?? null),
    getActivityPosts(context?.activityCategoryIds ?? []),
    getFollowedRegionPosts(context?.followedRegionIds ?? []),
    getLatestPosts()
  ])

  const seenIds = new Set<string>()
  const limit = HOME_SECTION_LIMIT || 10

  // Helper to filter seen posts
  const filterNew = (posts: PostWithDetails[]) => {
    const unique: PostWithDetails[] = []
    for (const p of posts) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id)
        unique.push(p)
      }
    }
    return unique
  }

  // Process sections in order of priority
  let regionPosts = filterNew(regionRaw)
  let activityPosts = filterNew(activityRaw)
  let followedRegionPosts = filterNew(followedRaw)
  let latestPosts = filterNew(latestRaw)

  // 2. Filling logic: If a section has < limit, fill from latestRaw posts
  // not yet assigned to any section. Uses a shared cursor (let) captured by
  // the fillSection closure — each call advances it, so sections draw from the
  // pool in order without overlap. Do NOT run fillSection calls in parallel.
  let latestCursor = 0

  const fillSection = (current: PostWithDetails[]) => {
    if (current.length >= limit) return current.slice(0, limit)
    const result = [...current]
    while (result.length < limit && latestCursor < latestPosts.length) {
      result.push(latestPosts[latestCursor])
      latestCursor++
    }
    return result
  }

  // We fill specialized sections first
  regionPosts = fillSection(regionPosts)
  activityPosts = fillSection(activityPosts)
  followedRegionPosts = fillSection(followedRegionPosts)

  // What's left in latestPosts (from the cursor onwards) stays in its section
  return {
    regionPosts,
    activityPosts,
    followedRegionPosts,
    latestPosts: latestPosts.slice(latestCursor, latestCursor + limit),
  }
}
