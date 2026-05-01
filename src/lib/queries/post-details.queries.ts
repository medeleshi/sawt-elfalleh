// src/lib/queries/post-details.queries.ts
// Canonical module for post detail page queries.
// post-details.ts has been removed — all functions live here.

import { createClient } from '@/lib/supabase/server'
import type { PostWithDetails } from '@/types/domain'

// ─── Full post details query ──────────────────────────────────────────────────

export async function getPostById(postId: string): Promise<PostWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts')
    .select(`
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
      updated_at,
      expires_at,
      user_id,
      category_id,
      region_id,
      unit_id,
      profiles (
        id,
        full_name,
        username,
        avatar_url,
        phone,
        show_phone,
        bio,
        created_at
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
    `)
    .eq('id', postId)
    .neq('status', 'deleted')
    .single() as any)

  if (error || !data) return null
  return data as unknown as PostWithDetails
}

// ─── Similar posts ────────────────────────────────────────────────────────────

export async function getSimilarPosts(
  categoryId: string,
  regionId: string,
  excludePostId: string,
  limit = 8
) {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts')
    .select(`
      id,
      type,
      title,
      price,
      is_negotiable,
      quantity,
      city,
      created_at,
      category:categories (name_ar, icon),
      region:regions (name_ar),
      unit:units (symbol, name_ar),
      post_images (url, sort_order)
    `)
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .eq('region_id', regionId)
    .neq('id', excludePostId)
    .order('created_at', { ascending: false })
    .limit(limit) as any)

  if (error) return []

  // Sort images per post
  const posts = (data ?? []) as any[]
  posts.forEach((p) => {
    if (p.post_images) {
      p.post_images.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }
  })

  return posts
}

// ─── Current viewer session ───────────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function isPostSaved(postId: string, userId: string | null): Promise<boolean> {
  if (!userId) return false
  const supabase = await createClient()
  const { data } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()
  
  return !!data
}
