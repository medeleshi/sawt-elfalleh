import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/db'

/**
 * Supabase client for use in Server Components and Server Actions.
 * Reads the session from cookies automatically.
 * Never use this in middleware — use middleware.ts client instead.
 */
export async function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as any)
            })
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // Middleware handles session refresh.
          }
        },
      },
    }
  )
}
