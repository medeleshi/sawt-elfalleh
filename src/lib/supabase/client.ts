import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/db'

/**
 * Supabase client for use in Client Components.
 * Use for: auth actions, file uploads, realtime subscriptions.
 * Never use for: server-side data fetching (use server.ts instead).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
