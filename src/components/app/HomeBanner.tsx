import Link from 'next/link'
import { Plus, ShoppingBag } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'
import type { UserRole } from '@/types/domain'

interface HomeBannerProps {
  userRole: UserRole
}

/**
 * Home page hero banner.
 * CTA buttons adapt to role:
 *   - citizen: cannot see "Add Sell Post" but can add buy post
 *   - farmer/trader: full CTA
 * Per spec §7.2: motivational copy + Add Post + Browse Marketplace buttons.
 */
export default function HomeBanner({ userRole }: HomeBannerProps) {
  const canSell = userRole === 'farmer' || userRole === 'trader'

  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-brand-700 to-brand-500 px-4 py-10 sm:py-14">
      {/* Decorative background shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/5" />
        {/* Wheat emoji watermark */}
        <span className="absolute left-6 top-4 text-7xl opacity-10 select-none">🌾</span>
        <span className="absolute bottom-4 right-8 text-5xl opacity-10 select-none">🌿</span>
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-xl text-center">
          {/* Badge */}
          <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
            السوق الفلاحي التونسي 🇹🇳
          </span>

          {/* Headline */}
          <h1 className="mb-3 text-2xl font-bold leading-snug text-white sm:text-3xl">
            بيع وشراء المنتجات الفلاحية
            <br />
            <span className="text-brand-100">بسهولة وثقة</span>
          </h1>

          {/* Sub-copy */}
          <p className="mb-8 text-sm leading-relaxed text-white/80">
            تواصل مباشرة مع الفلاحين والتجار في ولايتك وعبر كامل تونس
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Add Post — label adapts slightly by role */}
            <Link
              href={ROUTES.POST_NEW}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-50 hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {canSell ? 'أضف إعلانك' : 'أضف طلب شراء'}
            </Link>

            {/* Browse Marketplace */}
            <Link
              href={ROUTES.MARKETPLACE}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              تصفح السوق
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
