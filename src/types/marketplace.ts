// src/types/marketplace.ts

export type PostType = 'sell' | 'buy';
export type PostStatus = 'active' | 'expired' | 'deleted' | 'suspended';
export type SortOption = 'newest' | 'price_low' | 'price_high';

export interface MarketplaceFilters {
  query?: string;
  type?: PostType | '';
  category_id?: string;
  region_id?: string;
  unit_id?: string;
  price_min?: string;
  price_max?: string;
  is_negotiable?: string; // 'true' | '' (URL param)
  sort?: SortOption;
  page?: string;
}

export interface PostCard {
  id: string;
  type: PostType;
  title: string;
  price: number;
  is_negotiable: boolean;
  quantity: number;
  city: string | null;
  status: PostStatus;
  created_at: string;
  expires_at: string;
  category: { name_ar: string; icon: string | null } | null;
  region: { name_ar: string } | null;
  unit: { symbol: string; name_ar: string } | null;
  post_images: { url: string; sort_order: number }[];
  profiles: { full_name: string; avatar_url: string | null } | null;
}

export interface Category {
  id: string;
  name_ar: string;
  icon: string | null;
  parent_id: string | null;
}

export interface Region {
  id: string;
  name_ar: string;
}

export interface Unit {
  id: string;
  name_ar: string;
  symbol: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
