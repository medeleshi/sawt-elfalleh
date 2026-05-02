import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/utils/constants'

/**
 * Route protection middleware.
 *
 * Rule A: No session → redirect to /landing (not /login)
 *         Network error + session cookie present → pass through (don't log out)
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
  // Banned page is a public placeholder for suspended users
  '/banned',
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
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function shouldSkip(pathname: string): boolean {
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Returns true when the request has a Supabase session cookie.
 * Used as a network-error fallback: if cookies exist but getUser() failed
 * (e.g. no internet), we assume the user is still logged in and let them through
 * rather than bouncing them to /landing.
 */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )
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
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // ── Network error guard ───────────────────────────────────────────────────
  // If getUser() failed due to a network/fetch error (not a missing session) AND
  // the browser still holds a session cookie, assume the user is logged in and
  // let the request pass through rather than redirecting to /landing.
  const isNetworkError = !!authError && authError.message !== 'Auth session missing!'
  if (isNetworkError && hasSessionCookie(request)) {
    return supabaseResponse
  }

  // ── Rule A: No session ────────────────────────────────────────────────────
  if (!user) {
    // Auth pages are fine for unauthenticated users
    if (isAuthRoute(pathname)) return supabaseResponse

    // Public routes are fine
    if (isPublicRoute(pathname)) return supabaseResponse

    // Root `/` → show landing page for guests
    if (pathname === '/') {
      const response = NextResponse.redirect(new URL(ROUTES.LANDING, request.url))
      supabaseResponse.cookies.getAll().forEach((c) => {
        const { name, value, ...options } = c
        response.cookies.set(name, value, options as any)
      })
      return response
    }

    // All other protected routes → redirect to landing
    // so guests always see the marketing page first, not the login screen
    if (isProtectedRoute(pathname)) {
      const response = NextResponse.redirect(new URL(ROUTES.LANDING, request.url))
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
    .select('role, is_profile_completed, status')
    .eq('id', user.id)
    .single() as any)

  const isComplete = profile?.is_profile_completed === true
  const isSuspended = profile?.status === 'suspended'

  // ── Rule E: Suspended User Restrictions ───────────────────────────────────
  if (isSuspended) {
    if (pathname === '/banned') return supabaseResponse
    if (isPublicRoute(pathname)) return supabaseResponse
    // Block all protected routes and auth routes, force them to /banned
    const response = NextResponse.redirect(new URL('/banned', request.url))
    supabaseResponse.cookies.getAll().forEach((c) => {
      const { name, value, ...options } = c
      response.cookies.set(name, value, options as any)
    })
    return response
  }

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
    // Admins are exempt — they may never complete the user onboarding flow
    if (profile?.role === 'admin') return supabaseResponse
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
