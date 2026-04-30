// src/lib/queries/post-details.queries.ts

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
  excludePostId: string
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
    .limit(8) as any)

  if (error) return []
  return (data ?? []) as any[]
}

// ─── Current viewer session ───────────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}
