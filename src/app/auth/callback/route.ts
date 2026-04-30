import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'

/**
 * OAuth callback handler.
 * Supabase redirects here after Google OAuth with a `code` param.
 * We exchange the code for a session, then middleware handles the rest
 * (onboarding redirect if profile is incomplete).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    // No code — something went wrong on Supabase / Google side
    return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=oauth_failed`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=oauth_failed`)
  }

  // Middleware will check is_profile_completed and redirect to onboarding if needed.
  return NextResponse.redirect(`${origin}${ROUTES.HOME}`)
}
