import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  Tags,
  Sprout,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth.actions'
import { ROUTES } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: {
    default: 'لوحة الإدارة',
    template: '%s | لوحة الإدارة — صوت الفلاح',
  },
  robots: { index: false, follow: false },
}

const NAV_ITEMS = [
  { href: '/admin',              icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/admin/posts',        icon: FileText,        label: 'المنشورات' },
  { href: '/admin/users',        icon: Users,           label: 'المستخدمون' },
  { href: '/admin/reports',      icon: Flag,            label: 'البلاغات'   },
  { href: '/admin/categories',   icon: Tags,            label: 'الأصناف'    },
]

/**
 * Admin layout — server-side role verification as second layer of protection.
 * Middleware is the first layer; this is defense-in-depth.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await (supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as any)

  if (!profile || profile.role !== 'admin') redirect(ROUTES.HOME)

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-l border-border bg-white">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Sprout className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-bold text-brand-800">صوت الفلاح</p>
            <p className="text-[11px] text-muted-foreground">لوحة الإدارة</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="border-t border-border p-3">
          <div className="rounded-lg bg-muted px-3 py-2.5">
            <p className="text-xs font-medium text-foreground truncate">
              {profile.full_name}
            </p>
            <p className="text-[11px] text-muted-foreground">مدير النظام</p>
          </div>
          {/* Logout via logoutAction Server Action — properly calls signOut() */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
