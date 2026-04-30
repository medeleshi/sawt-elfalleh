import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/utils/constants'

/**
 * Route protection middleware.
 *
 * Rule A: No session → redirect to /login
 * Rule B: Session + onboarding incomplete (or no profile row) → redirect to /onboarding/profile
 * Rule C: /admin route + role !== 'admin' → redirect to /
 * Rule D: Logged-in + complete profile visiting auth pages → redirect to /
 *
 * Performance: only queries profiles(role, is_profile_completed) — no joins.
 */

// ─── Route classification ─────────────────────────────────────────────────────

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
  // Marketplace is public per spec (section 23.1)
  '/marketplace',
]

/** Auth pages — public but redirect away when already logged in */
const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/reset-success',
]

/** Always skip — static assets, Next internals, API routes, OAuth callback */
const SKIP_PREFIXES = [
  '/_next',
  '/favicon',
  '/api',
  '/robots',
  '/sitemap',
  '/auth',   // covers /auth/callback — must never be blocked
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isProtectedRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function shouldSkip(pathname: string): boolean {
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Always skip static assets, Next internals, API routes, OAuth callback
  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  // 2. All non-skipped routes need session info — initialize client
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  // Refresh session tokens (required by @supabase/ssr)
  // This also handles cookie setting in supabaseResponse via setAll callback
  const { data: { user } } = await supabase.auth.getUser()

  // ── Rule A: No session ────────────────────────────────────────────────────
  if (!user) {
    // Auth pages are fine for unauthenticated users
    if (isAuthRoute(pathname)) return supabaseResponse
    
    // Public routes are fine
    if (isPublicRoute(pathname)) return supabaseResponse

    // All protected routes need a login
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set('next', pathname)
      
      // IMPORTANT: Must copy cookies from supabaseResponse to the redirect response
      const response = NextResponse.redirect(loginUrl)
      supabaseResponse.cookies.getAll().forEach((c) => {
        const { name, value, ...options } = c
        response.cookies.set(name, value, options as any)
      })
      return response
    }
    return supabaseResponse
  }

  // ── User is authenticated — fetch minimal profile data ────────────────────
  const { data: profile } = await (supabase
    .from('profiles')
    .select('role, is_profile_completed')
    .eq('id', user.id)
    .single() as any)

  const isComplete = profile?.is_profile_completed === true

  // ── Rule D: Logged-in + complete profile on auth pages → home ────────────
  if (isAuthRoute(pathname) && isComplete) {
    const response = NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    supabaseResponse.cookies.getAll().forEach((c) => {
      const { name, value, ...options } = c
      response.cookies.set(name, value, options as any)
    })
    return response
  }

  // ── Rule B: Onboarding incomplete (null profile OR flag = false) ──────────
  if (!isComplete) {
    const isOnboardingRoute = pathname.startsWith('/onboarding')
    // Let them stay on auth pages (e.g. /reset-password from email link)
    if (isAuthRoute(pathname)) return supabaseResponse
    // Let them progress through onboarding
    if (isOnboardingRoute) return supabaseResponse
    // Block everything else and send to onboarding
    const response = NextResponse.redirect(
      new URL(ROUTES.ONBOARDING_PROFILE, request.url)
    )
    supabaseResponse.cookies.getAll().forEach((c) => {
      const { name, value, ...options } = c
      response.cookies.set(name, value, options as any)
    })
    return response
  }

  // ── Rule C: Admin route protection ───────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!profile || profile.role !== 'admin') {
      const response = NextResponse.redirect(new URL(ROUTES.HOME, request.url))
      supabaseResponse.cookies.getAll().forEach((c) => {
        const { name, value, ...options } = c
        response.cookies.set(name, value, options as any)
      })
      return response
    }
  }

  // ── Redirect complete users away from onboarding ──────────────────────────
  if (pathname.startsWith('/onboarding')) {
    const response = NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    supabaseResponse.cookies.getAll().forEach((c) => {
      const { name, value, ...options } = c
      response.cookies.set(name, value, options as any)
    })
    return response
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
  ],
}
