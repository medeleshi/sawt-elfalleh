import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { ROUTES } from '@/lib/utils/constants'
import type { Database } from '@/types/db'

/**
 * Route protection middleware.
 */

const PROTECTED_PREFIXES = [
  '/onboarding',
  '/post',
  '/profile',
  '/settings',
  '/notifications',
  '/messages',
  '/admin',
]

const PUBLIC_PREFIXES = [
  '/landing',
  '/about',
  '/contact',
  '/how-it-works',
  '/privacy-policy',
  '/terms',
  '/offline',
  '/marketplace',
  '/banned',
]

const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/reset-success',
]

const SKIP_PREFIXES = [
  '/_next',
  '/favicon',
  '/api',
  '/robots',
  '/sitemap',
  '/auth',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function shouldSkip(pathname: string): boolean {
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  // 1. Initialize Supabase client with the standard SSR pattern
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Refresh session tokens
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 3. Network error guard
  const isNetworkError = !!authError && authError.message !== 'Auth session missing!'
  if (isNetworkError && hasSessionCookie(request)) {
    return supabaseResponse
  }

  // 4. Rule A: No session
  if (!user) {
    if (isAuthRoute(pathname)) return supabaseResponse
    if (isPublicRoute(pathname)) return supabaseResponse

    if (pathname === '/') {
      return NextResponse.redirect(new URL(ROUTES.LANDING, request.url))
    }

    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(ROUTES.LANDING, request.url))
    }

    return supabaseResponse
  }

  // 5. User is authenticated — fetch profile using service role for reliability
  const serviceRoleSupabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await (serviceRoleSupabase
    .from('profiles')
    .select('role, is_profile_completed, status')
    .eq('id', user.id)
    .single() as any)

  const isComplete = profile?.is_profile_completed === true
  const isSuspended = profile?.status === 'suspended'

  // 6. Rule E: Suspended User Restrictions
  if (isSuspended) {
    if (pathname === '/banned') return supabaseResponse
    
    // Explicitly block core content for banned users
    if (
      pathname === '/' || 
      pathname.startsWith('/marketplace') || 
      pathname.startsWith('/post')
    ) {
      return NextResponse.redirect(new URL('/banned', request.url))
    }

    if (isPublicRoute(pathname)) return supabaseResponse
    return NextResponse.redirect(new URL('/banned', request.url))
  }

  // 7. Rule D: Logged-in + complete profile on auth pages → home
  if (isAuthRoute(pathname) && isComplete) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
  }

  // 8. Rule B: Onboarding incomplete
  if (!isComplete) {
    const isOnboardingRoute = pathname.startsWith('/onboarding')
    if (isAuthRoute(pathname)) return supabaseResponse
    if (isOnboardingRoute) return supabaseResponse
    if (profile?.role === 'admin') return supabaseResponse
    return NextResponse.redirect(new URL(ROUTES.ONBOARDING_PROFILE, request.url))
  }

  // 9. Rule C: Admin pages protection
  if (pathname.startsWith('/admin')) {
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
  }

  // 10. Redirect complete users away from onboarding
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
  ],
}
