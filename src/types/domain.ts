import type {
  Database,
  UserRole,
  PostType,
  PostStatus,
  ContactType,
  ReportStatus,
} from './db'

// ─── Base row aliases ─────────────────────────────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostImage = Database['public']['Tables']['post_images']['Row']
export type Region = Database['public']['Tables']['regions']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type SavedPost = Database['public']['Tables']['saved_posts']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']
export type UserActivity = Database['public']['Tables']['user_activities']['Row']
export type UserFollowedRegion = Database['public']['Tables']['user_followed_regions']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']
export type StaticPage = Database['public']['Tables']['static_pages']['Row']

// ─── Enriched / joined types ──────────────────────────────────────────────────

/** Post card — used in listing pages. Joins profile, category, region, unit, images. */
export type PostWithDetails = Post & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url' | 'phone' | 'show_phone'>
  category: Pick<Category, 'id' | 'name_ar' | 'icon' | 'slug'>
  region: Pick<Region, 'id' | 'name_ar' | 'code'>
  unit: Pick<Unit, 'id' | 'name_ar' | 'symbol'>
  post_images: Pick<PostImage, 'id' | 'url' | 'sort_order'>[]
}

/** Public profile — used on profile pages. Includes stats. */
export type PublicProfile = Profile & {
  regions: Pick<Region, 'id' | 'name_ar'> | null
  _count?: {
    posts: number
    active_posts: number
  }
}

// ─── Server Action return types ───────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; message?: string }

// ─── Re-export enums for convenience ─────────────────────────────────────────

export type { UserRole, PostType, PostStatus, ContactType, ReportStatus }
