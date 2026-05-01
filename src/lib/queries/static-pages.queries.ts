// src/lib/queries/static-pages.queries.ts
// Reads content from static_pages table with fallback to hardcoded content.

import { createClient } from '@/lib/supabase/server'

export type StaticPageContent = {
  title: string
  content: string | null
  fromDb: boolean
}

/**
 * Fetch a static page by slug from the DB.
 * Returns null if not found — caller decides fallback.
 */
export async function getStaticPage(slug: string): Promise<StaticPageContent | null> {
  try {
    const supabase = (await createClient()) as any
    const { data, error } = await supabase
      .from('static_pages')
      .select('title_ar, content_ar')
      .eq('slug', slug)
      .single()

    if (error || !data) return null

    return {
      title: data.title_ar,
      content: data.content_ar,
      fromDb: true,
    }
  } catch {
    return null
  }
}

/**
 * Fetch top-level categories for the landing page preview.
 */
export async function getLandingCategories() {
  try {
    const supabase = (await createClient()) as any
    const { data } = await supabase
      .from('categories')
      .select('id, name_ar, icon, slug')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(12)

    return data ?? []
  } catch {
    return []
  }
}
