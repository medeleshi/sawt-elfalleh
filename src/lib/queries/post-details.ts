// src/lib/queries/post-details.ts

import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostDetails {
  id: string
  type: 'sell' | 'buy'
  title: string
  description: string | null
  quantity: number
  price: number
  is_negotiable: boolean
  city: string | null
  status: string
  created_at: string
  expires_at: string
  user_id: string
  category_id: string
  region_id: string
  category: { id: string; name_ar: string; icon: string | null; slug: string } | null
  region: { id: string; name_ar: string; name_fr: string | null } | null
  unit: { id: string; name_ar: string; symbol: string } | null
  post_images: { id: string; url: string; storage_path: string; sort_order: number }[]
  profiles: {
    id: string
    full_name: string
    username: string | null
    avatar_url: string | null
    phone: string | null
    show_phone: boolean
    role: string
    region_id: string | null
    city: string | null
    bio: string | null
    created_at: string
  } | null
}

export interface SimilarPost {
  id: string
  type: 'sell' | 'buy'
  title: string
  price: number
  is_negotiable: boolean
  quantity: number
  city: string | null
  created_at: string
  category: { name_ar: string; icon: string | null } | null
  region: { name_ar: string } | null
  unit: { symbol: string; name_ar: string } | null
  post_images: { url: string; sort_order: number }[]
  profiles: { full_name: string; avatar_url: string | null } | null
}

// ─── Fetch post details ───────────────────────────────────────────────────────

export async function getPostDetails(postId: string): Promise<PostDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      type,
      title,
      description,
      quantity,
      price,
      is_negotiable,
      city,
      status,
      created_at,
      expires_at,
      user_id,
      category_id,
      region_id,
      category:categories(id, name_ar, icon, slug),
      region:regions(id, name_ar, name_fr),
      unit:units(id, name_ar, symbol),
      post_images(id, url, storage_path, sort_order),
      profiles(id, full_name, username, avatar_url, phone, show_phone, role, region_id, city, bio, created_at)
      `
    )
    .eq('id', postId)
    .neq('status', 'deleted')
    .single()

  if (error || !data) return null

  const postData = data as any

  // Sort images by sort_order
  if (postData.post_images) {
    postData.post_images.sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    )
  }

  return postData as unknown as PostDetails
}

// ─── Fetch similar posts ──────────────────────────────────────────────────────

export async function getSimilarPosts(
  categoryId: string,
  regionId: string,
  excludePostId: string,
  limit = 8
): Promise<SimilarPost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      type,
      title,
      price,
      is_negotiable,
      quantity,
      city,
      created_at,
      category:categories(name_ar, icon),
      region:regions(name_ar),
      unit:units(symbol, name_ar),
      post_images(url, sort_order),
      profiles(full_name, avatar_url)
      `
    )
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .eq('region_id', regionId)
    .neq('id', excludePostId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  // Sort images per post
  const posts = (data ?? []) as unknown as SimilarPost[]
  posts.forEach((p) => {
    if (p.post_images) {
      p.post_images.sort((a, b) => a.sort_order - b.sort_order)
    }
  })

  return posts
}

// ─── Track post view (server-side insert) ────────────────────────────────────

export async function trackPostView(
  postId: string,
  viewerId: string | null,
  ipHash: string | null
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('post_views').insert({
    post_id: postId,
    viewer_id: viewerId,
    ip_hash: ipHash,
  } as any)
}