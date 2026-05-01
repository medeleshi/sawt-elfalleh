// src/lib/queries/marketplace.ts

import { createClient } from '@/lib/supabase/server';
import { MARKETPLACE_PAGE_SIZE } from '@/lib/utils/constants';
import type { MarketplaceFilters, PostCard, PaginationInfo, Category, Region, Unit } from '@/types/marketplace';

const PAGE_LIMIT = MARKETPLACE_PAGE_SIZE;

export async function getMarketplacePosts(filters: MarketplaceFilters): Promise<{
  posts: PostCard[];
  pagination: PaginationInfo;
}> {
  const supabase = await createClient();

  const page = Math.max(1, parseInt(filters.page || '1', 10));
  const limit = PAGE_LIMIT;
  const offset = (page - 1) * limit;

  // ── Build base query ──
  let query = supabase
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
      status,
      created_at,
      expires_at,
      category:categories(name_ar, icon),
      region:regions(name_ar),
      unit:units(symbol, name_ar),
      post_images(url, sort_order),
      profiles(full_name, avatar_url)
      `,
      { count: 'exact' }
    )
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  // ── Apply filters ──
  if (filters.query?.trim()) {
    query = query.ilike('title', `%${filters.query.trim()}%`);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.category_id) {
    const ids = filters.category_id.split(',').filter(Boolean)
    if (ids.length > 1) {
      query = query.in('category_id', ids)
    } else {
      query = query.eq('category_id', ids[0])
    }
  }

  if (filters.region_id) {
    const ids = filters.region_id.split(',').filter(Boolean)
    if (ids.length > 1) {
      query = query.in('region_id', ids)
    } else {
      query = query.eq('region_id', ids[0])
    }
  }

  if (filters.unit_id) {
    query = query.eq('unit_id', filters.unit_id);
  }

  if (filters.price_min) {
    const min = parseFloat(filters.price_min);
    if (!isNaN(min)) query = query.gte('price', min);
  }

  if (filters.price_max) {
    const max = parseFloat(filters.price_max);
    if (!isNaN(max)) query = query.lte('price', max);
  }

  if (filters.is_negotiable === 'true') {
    query = query.eq('is_negotiable', true);
  }

  // ── Sorting ──
  switch (filters.sort) {
    case 'price_low':
      query = query.order('price', { ascending: true });
      break;
    case 'price_high':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // ── Pagination ──
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Marketplace query error:', error);
    return {
      posts: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const total = count ?? 0;

  return {
    posts: (data ?? []) as unknown as PostCard[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMarketplaceCatalog(): Promise<{
  categories: Category[];
  regions: Region[];
  units: Unit[];
}> {
  const supabase = await createClient();

  const [categoriesRes, regionsRes, unitsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name_ar, icon, parent_id')
      .eq('is_active', true)
      .order('sort_order'),
    supabase.from('regions').select('id, name_ar').order('sort_order'),
    supabase.from('units').select('id, name_ar, symbol').order('sort_order'),
  ]);

  return {
    categories: (categoriesRes.data ?? []) as Category[],
    regions: (regionsRes.data ?? []) as Region[],
    units: (unitsRes.data ?? []) as Unit[],
  };
}
