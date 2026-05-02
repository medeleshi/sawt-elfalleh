import { createClient } from '@/lib/supabase/server'

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminStats() {
  const supabase = await createClient()

  const [
    { count: totalPosts },
    { count: activePosts },
    { count: suspendedPosts },
    { count: totalUsers },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'suspended'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  return {
    totalPosts: totalPosts ?? 0,
    activePosts: activePosts ?? 0,
    suspendedPosts: suspendedPosts ?? 0,
    totalUsers: totalUsers ?? 0,
    pendingReports: pendingReports ?? 0,
  }
}

// ─── Admin Posts List ─────────────────────────────────────────────────────────

export async function getAdminPosts(options: {
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const { status, page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  let query = supabase
    .from('posts')
    .select(
      `
      id, title, type, status, price, created_at, city,
      profiles:user_id ( id, full_name, username, role ),
      categories:category_id ( name_ar, icon ),
      regions:region_id ( name_ar )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  return { posts: data ?? [], total: count ?? 0, error }
}

// ─── Admin Users List ─────────────────────────────────────────────────────────

export async function getAdminUsers(options: {
  role?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const { role, page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  let query = supabase
    .from('profiles')
    .select(
      `
      id, full_name, username, role, phone, city, created_at, status, reports_count,
      regions:region_id ( name_ar )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  const { data, count } = await query
  return { users: data ?? [], total: count ?? 0 }
}

// ─── Admin Reports List ───────────────────────────────────────────────────────

export async function getAdminReports(options: {
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const { status, page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  let query = supabase
    .from('reports')
    .select(
      `
      id, reason, status, admin_note, created_at,
      post_id,
      reported_user_id,
      reporter:reporter_id ( id, full_name, username ),
      post:post_id ( id, title, status ),
      reported_user:reported_user_id ( id, full_name, username )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count } = await query
  return { reports: data ?? [], total: count ?? 0 }
}

// ─── Admin Categories ─────────────────────────────────────────────────────────

export async function getAdminCategories() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar, name_fr, slug, icon, parent_id, sort_order, is_active')
    .order('sort_order', { ascending: true })

  const { data: units } = await supabase
    .from('units')
    .select('id, name_ar, name_fr, symbol, sort_order')
    .order('sort_order', { ascending: true })

  const { data: regions } = await supabase
    .from('regions')
    .select('id, name_ar, name_fr, code, sort_order')
    .order('sort_order', { ascending: true })

  return {
    categories: categories ?? [],
    units: units ?? [],
    regions: regions ?? [],
  }
}
