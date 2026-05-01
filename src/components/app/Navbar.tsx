import Link from 'next/link'
import { Bell, Sprout } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'
import UserDropdown from './UserDropdown'
import NavbarSearch from './NavbarSearch'

/**
 * Main app Navbar — Server Component.
 *
 * Layout (RTL): logo (right) | search (center) | notifications + dropdown (left)
 *
 * Server responsibilities:
 *   - fetch profile for UserDropdown (name, avatar, role)
 * Client components rendered inside:
 *   - NavbarSearch  → handles form submit + router.push
 *   - UserDropdown  → handles open/close state + logout
 */
export default async function Navbar() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role')
      .eq('id', user.id)
      .maybeSingle()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center gap-3">

        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link
          href={ROUTES.HOME}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="صوت الفلاح — الرئيسية"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Sprout className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-base font-bold text-brand-800 hidden sm:block">
            صوت الفلاح
          </span>
        </Link>

        {/* ── Search (Client Component) ─────────────────────────── */}
        <NavbarSearch />

        {/* ── Right actions ─────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Notifications */}
          <Link
            href={ROUTES.NOTIFICATIONS}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" />
          </Link>

          {/* User dropdown */}
          {profile && <UserDropdown profile={profile} />}
        </div>

      </div>
    </header>
  )
}
