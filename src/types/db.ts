/**
 * Database types matching the Supabase schema exactly.
 * Do NOT modify these to match DB schema — update schema.sql instead.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'trader' | 'citizen' | 'admin'
export type UserStatus = 'active' | 'suspended'
export type PostType = 'sell' | 'buy'
export type PostStatus = 'active' | 'expired' | 'deleted' | 'suspended'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ContactType = 'phone' | 'whatsapp'

// ─── Database interface (Supabase client generic) ────────────────────────────

export interface PublicRowTypes {
  regions: {

          id: string
          name_ar: string
          name_fr: string | null
          code: string
          sort_order: number
          created_at: string
          }
  categories: {

          id: string
          name_ar: string
          name_fr: string | null
          slug: string
          icon: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          }
  units: {

          id: string
          name_ar: string
          name_fr: string | null
          symbol: string
          sort_order: number
          created_at: string
          }
  profiles: {

          id: string
          full_name: string
          username: string | null
          avatar_url: string | null
          role: UserRole
          status: UserStatus
          phone: string | null
          bio: string | null
          region_id: string | null
          city: string | null
          show_phone: boolean
          is_profile_completed: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          }
  user_activities: {

          id: string
          user_id: string
          category_id: string
          }
  user_followed_regions: {

          id: string
          user_id: string
          region_id: string
          created_at: string
          }
  notification_settings: {

          id: string
          user_id: string
          new_post_region: boolean
          new_post_activity: boolean
          messages: boolean
          platform_updates: boolean
          updated_at: string
          }
  posts: {

          id: string
          user_id: string
          type: PostType
          category_id: string
          title: string
          description: string | null
          quantity: number
          unit_id: string
          price: number
          is_negotiable: boolean
          region_id: string
          city: string | null
          status: PostStatus
          expires_at: string
          created_at: string
          updated_at: string
          }
  post_images: {

          id: string
          post_id: string
          url: string
          storage_path: string
          sort_order: number
          created_at: string
          }
  post_views: {

          id: string
          post_id: string
          viewer_id: string | null
          ip_hash: string | null
          created_at: string
          }
  post_contacts: {

          id: string
          post_id: string
          requester_id: string | null
          contact_type: ContactType
          created_at: string
          }
  saved_posts: {

          id: string
          user_id: string
          post_id: string
          created_at: string
          }
  price_history: {

          id: string
          category_id: string
          region_id: string | null
          unit_id: string
          min_price: number
          max_price: number
          recorded_at: string
          }
  admin_logs: {

          id: string
          admin_id: string
          action: string
          target_type: 'user' | 'post' | 'report' | 'category' | 'unit' | null
          target_id: string | null
          details: Record<string, unknown>
          created_at: string
          }
  static_pages: {

          id: string
          slug: string
          title_ar: string
          content_ar: string | null
          updated_at: string
          }
}

export interface PublicRowTypes {
  reports: {

          id: string
          reporter_id: string
          post_id: string | null
          reported_user_id: string | null
          reason: string
          status: ReportStatus
          admin_note: string | null
          created_at: string
          }
  notifications: {

          id: string
          user_id: string
          type: string
          title: string | null
          body: string | null
          data: Record<string, unknown>
          is_read: boolean
          created_at: string
          }
}

export type Database = {
  public: {
    Tables: {
      regions: {
        Row: PublicRowTypes['regions']
        Insert: Omit<PublicRowTypes['regions'], 'id' | 'created_at'>
        Update: Partial<Omit<PublicRowTypes['regions'], 'id' | 'created_at'>>
      }

      categories: {
        Row: PublicRowTypes['categories']
        Insert: Omit<PublicRowTypes['categories'], 'id' | 'created_at'>
        Update: Partial<Omit<PublicRowTypes['categories'], 'id' | 'created_at'>>
      }

      units: {
        Row: PublicRowTypes['units']
        Insert: Omit<PublicRowTypes['units'], 'id' | 'created_at'>
        Update: Partial<Omit<PublicRowTypes['units'], 'id' | 'created_at'>>
      }

      profiles: {
        Row: PublicRowTypes['profiles']
        Insert: Omit<PublicRowTypes['profiles'], 'created_at' | 'updated_at'>
        Update: Partial<Omit<PublicRowTypes['profiles'], 'created_at' | 'updated_at'>>
      }

      user_activities: {
        Row: PublicRowTypes['user_activities']
        Insert: Omit<PublicRowTypes['user_activities'], 'id'>
        Update: never
      }

      user_followed_regions: {
        Row: PublicRowTypes['user_followed_regions']
        Insert: Omit<PublicRowTypes['user_followed_regions'], 'id' | 'created_at'>
        Update: never
      }

      notification_settings: {
        Row: PublicRowTypes['notification_settings']
        Insert: Omit<PublicRowTypes['notification_settings'], 'id' | 'updated_at'>
        Update: Partial<Omit<PublicRowTypes['notification_settings'], 'id' | 'updated_at'>>
      }

      posts: {
        Row: PublicRowTypes['posts']
        Insert: Omit<PublicRowTypes['posts'], 'id' | 'created_at' | 'updated_at' | 'expires_at' | 'status'>
        Update: Partial<Omit<PublicRowTypes['posts'], 'id' | 'created_at' | 'updated_at' | 'expires_at' | 'status'>>
      }

      post_images: {
        Row: PublicRowTypes['post_images']
        Insert: Omit<PublicRowTypes['post_images'], 'id' | 'created_at'>
        Update: Partial<Omit<PublicRowTypes['post_images'], 'id' | 'created_at'>>
      }

      post_views: {
        Row: PublicRowTypes['post_views']
        Insert: Omit<PublicRowTypes['post_views'], 'id' | 'created_at'>
        Update: never
      }

      post_contacts: {
        Row: PublicRowTypes['post_contacts']
        Insert: Omit<PublicRowTypes['post_contacts'], 'id' | 'created_at'>
        Update: never
      }

      saved_posts: {
        Row: PublicRowTypes['saved_posts']
        Insert: Omit<PublicRowTypes['saved_posts'], 'id' | 'created_at'>
        Update: never
      }

      reports: {
        Row: {
          id: string
          reporter_id: string
          post_id: string | null
          reported_user_id: string | null
          reason: string
          status: ReportStatus
          admin_note: string | null
          created_at: string
        }
        Insert: Omit<PublicRowTypes['reports'], 'id' | 'created_at' | 'status'>
        Update: Partial<Pick<PublicRowTypes['reports'], 'status' | 'admin_note'>>
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string | null
          body: string | null
          data: Record<string, unknown>
          is_read: boolean
          created_at: string
        }
        Insert: Omit<PublicRowTypes['notifications'], 'id' | 'created_at' | 'is_read'>
        Update: Partial<Pick<PublicRowTypes['notifications'], 'is_read'>>
      }

      price_history: {
        Row: PublicRowTypes['price_history']
        Insert: Omit<PublicRowTypes['price_history'], 'id' | 'recorded_at'>
        Update: never
      }

      admin_logs: {
        Row: PublicRowTypes['admin_logs']
        Insert: Omit<PublicRowTypes['admin_logs'], 'id' | 'created_at'>
        Update: never
      }

      static_pages: {
        Row: PublicRowTypes['static_pages']
        Insert: Omit<PublicRowTypes['static_pages'], 'id' | 'updated_at'>
        Update: Partial<Omit<PublicRowTypes['static_pages'], 'id' | 'updated_at'>>
      }
    }
    Enums: {
      user_role: UserRole
      post_type: PostType
      post_status: PostStatus
      report_status: ReportStatus
      contact_type: ContactType
    }
  }
}
