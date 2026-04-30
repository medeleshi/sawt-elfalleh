/**
 * Database types matching the Supabase schema exactly.
 * Do NOT modify these to match DB schema — update schema.sql instead.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'trader' | 'citizen' | 'admin'
export type PostType = 'sell' | 'buy'
export type PostStatus = 'active' | 'expired' | 'deleted' | 'suspended'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ContactType = 'phone' | 'whatsapp'

// ─── Database interface (Supabase client generic) ────────────────────────────

export type Database = {
  public: {
    Tables: {
      regions: {
        Row: {
          id: string
          name_ar: string
          name_fr: string | null
          code: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['regions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['regions']['Insert']>
      }

      categories: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }

      units: {
        Row: {
          id: string
          name_ar: string
          name_fr: string | null
          symbol: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['units']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['units']['Insert']>
      }

      profiles: {
        Row: {
          id: string
          full_name: string
          username: string | null
          avatar_url: string | null
          role: UserRole
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
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      user_activities: {
        Row: {
          id: string
          user_id: string
          category_id: string
        }
        Insert: Omit<Database['public']['Tables']['user_activities']['Row'], 'id'>
        Update: never
      }

      user_followed_regions: {
        Row: {
          id: string
          user_id: string
          region_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_followed_regions']['Row'], 'id' | 'created_at'>
        Update: never
      }

      notification_settings: {
        Row: {
          id: string
          user_id: string
          new_post_region: boolean
          new_post_activity: boolean
          messages: boolean
          platform_updates: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notification_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notification_settings']['Insert']>
      }

      posts: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'expires_at' | 'status'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }

      post_images: {
        Row: {
          id: string
          post_id: string
          url: string
          storage_path: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['post_images']['Insert']>
      }

      post_views: {
        Row: {
          id: string
          post_id: string
          viewer_id: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_views']['Row'], 'id' | 'created_at'>
        Update: never
      }

      post_contacts: {
        Row: {
          id: string
          post_id: string
          requester_id: string | null
          contact_type: ContactType
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_contacts']['Row'], 'id' | 'created_at'>
        Update: never
      }

      saved_posts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_posts']['Row'], 'id' | 'created_at'>
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
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'status'>
        Update: Partial<Pick<Database['public']['Tables']['reports']['Row'], 'status' | 'admin_note'>>
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
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'is_read'>
        Update: Partial<Pick<Database['public']['Tables']['notifications']['Row'], 'is_read'>>
      }

      price_history: {
        Row: {
          id: string
          category_id: string
          region_id: string | null
          unit_id: string
          min_price: number
          max_price: number
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['price_history']['Row'], 'id' | 'recorded_at'>
        Update: never
      }

      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: 'user' | 'post' | 'report' | 'category' | 'unit' | null
          target_id: string | null
          details: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }

      static_pages: {
        Row: {
          id: string
          slug: string
          title_ar: string
          content_ar: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['static_pages']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['static_pages']['Insert']>
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
