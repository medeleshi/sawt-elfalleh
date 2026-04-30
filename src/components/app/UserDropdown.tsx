'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  User,
  Bookmark,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROUTES, ROLE_LABELS } from '@/lib/utils/constants'
import type { UserRole } from '@/types/domain'

interface UserDropdownProps {
  profile: {
    id: string
    full_name: string
    username: string | null
    avatar_url: string | null
    role: UserRole
  }
}

export default function UserDropdown({ profile }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoggingOut(true)
    setOpen(false)
    await supabase.auth.signOut()
    // Refresh server state first so Next.js clears cached layouts,
    // then navigate to login.
    router.refresh()
    router.push(ROUTES.LOGIN)
  }

  const initials = profile.full_name
    ? profile.full_name.slice(0, 2)
    : '؟؟'

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loggingOut}
        className="flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="قائمة المستخدم"
      >
        {/* Avatar */}
        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-brand-100">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-medium text-brand-700">
              {initials}
            </span>
          )}
        </span>

        <span className="hidden max-w-[100px] truncate text-sm font-medium leading-none md:block">
          {profile.full_name}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-muted-foreground transition-transform md:block ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="menu"
            className="absolute left-0 z-50 mt-2 w-52 origin-top-left animate-in rounded-xl border border-border bg-white py-1.5 shadow-lg ring-1 ring-black/5"
          >
            {/* User info header */}
            <div className="border-b border-border px-4 pb-2.5 pt-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[profile.role]}
              </p>
            </div>

            {/* Menu items */}
            <nav className="mt-1.5 px-1.5">
              <MenuItem
                href={ROUTES.PROFILE_ME}
                icon={<User className="h-4 w-4" />}
                label="ملفي الشخصي"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                href={`${ROUTES.PROFILE_ME}#saved`}
                icon={<Bookmark className="h-4 w-4" />}
                label="المنشورات المحفوظة"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                href={ROUTES.SETTINGS}
                icon={<Settings className="h-4 w-4" />}
                label="الإعدادات"
                onClick={() => setOpen(false)}
              />
            </nav>

            {/* Logout */}
            <div className="mt-1 border-t border-border px-1.5 pt-1.5">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                {loggingOut ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {loggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Local helper ─────────────────────────────────────────────────────────────

function MenuItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  )
}
