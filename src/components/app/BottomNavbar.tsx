'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, PlusSquare, Bell, User } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'

export default function BottomNavbar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'الرئيسية',
      href: ROUTES.HOME,
      icon: Home,
    },
    {
      label: 'السوق',
      href: ROUTES.MARKETPLACE,
      icon: Store,
    },
    {
      label: 'إعلان',
      href: ROUTES.POST_NEW,
      icon: PlusSquare,
      highlight: true,
    },
    {
      label: 'الإشعارات',
      href: ROUTES.NOTIFICATIONS,
      icon: Bell,
    },
    {
      label: 'حسابي',
      href: ROUTES.PROFILE_ME,
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur sm:hidden h-16 safe-area-pb">
      <div className="grid h-full grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-brand-600" : "text-stone-500",
                item.highlight && "text-brand-700"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg",
                item.highlight && "bg-brand-50 text-brand-600 border border-brand-100 shadow-sm"
              )}>
                <Icon className={cn("h-5 w-5", item.highlight && "h-6 w-6")} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
