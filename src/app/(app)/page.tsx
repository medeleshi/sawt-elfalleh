import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'
import {
  getUnifiedHomeFeed,
  getUserContext,
} from '@/lib/queries/home.queries'
import HomeBanner from '@/components/app/HomeBanner'
import HomeSection from '@/components/posts/HomeSection'

export const metadata: Metadata = {
  title: 'الرئيسية',
  description: 'السوق الفلاحي التونسي — بيع وشراء المنتجات الفلاحية بسهولة وثقة',
}

/**
 * Home page — fully Server Component.
 *
 * Data flow:
 *   1. getUser()  →  redirect to login if unauthenticated
 *   2. getUserContext()  →  fetches region_id, activity categories, followed regions
 *   3. All 4 section queries run in parallel via Promise.all
 *   4. Results passed to HomeSection components
 *
 * "View More" hrefs pass filter params to /marketplace so the user
 * lands on a pre-filtered listing matching the section's context.
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  // ── Unified Step: Fetch all sections with deduplication ───────────────────
  const { 
    regionPosts, 
    activityPosts, 
    latestPosts, 
    followedRegionPosts 
  } = await getUnifiedHomeFeed(user.id)

  const ctx = await getUserContext(user.id)

  // ── Marketplace "View More" hrefs with context-aware filters ──────────────
  const myRegionHref = ctx.regionId
    ? `${ROUTES.MARKETPLACE}?region_id=${ctx.regionId}`
    : ROUTES.MARKETPLACE

  const activityHref =
    ctx.activityCategoryIds.length > 0
      ? `${ROUTES.MARKETPLACE}?category_id=${ctx.activityCategoryIds.join(',')}`
      : ROUTES.MARKETPLACE

  const latestHref = `${ROUTES.MARKETPLACE}?sort=newest`

  const followedHref =
    ctx.followedRegionIds.length > 0
      ? `${ROUTES.MARKETPLACE}?region_id=${ctx.followedRegionIds.join(',')}`
      : ROUTES.MARKETPLACE

  // ── Fetch role for HomeBanner CTA label ──────────────────────────────────
  const { data: profile } = await (supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any)

  const userRole = profile?.role ?? 'citizen'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <HomeBanner userRole={userRole} />

      {/* ── Feed sections ───────────────────────────────────────────────────── */}
      <div className="container space-y-10 py-8 sm:py-12">

        {/* Section 1: My region */}
        <HomeSection
          title="منشورات من ولايتك"
          posts={regionPosts}
          viewMoreHref={myRegionHref}
          emptyTitle="لا توجد منشورات في ولايتك بعد"
          emptyDescription="كن أول من ينشر في منطقتك أو تصفح السوق الكامل"
        />

        {/* Section 2: Activity matching */}
        <HomeSection
          title="منشورات تناسب نشاطك"
          posts={activityPosts}
          viewMoreHref={activityHref}
          emptyTitle="لم نجد منشورات تناسب أنشطتك"
          emptyDescription="أضف أنشطتك من الإعدادات لنعرض لك منشورات مناسبة"
        />

        {/* Section 3: Latest posts — always shown */}
        <HomeSection
          title="أحدث المنشورات"
          posts={latestPosts}
          viewMoreHref={latestHref}
          emptyTitle="لا توجد منشورات حديثة"
          emptyDescription="كن أول من ينشر في السوق"
        />

        {/* Section 4: Followed regions */}
        <HomeSection
          title="منشورات من ولايات تتابعها"
          posts={followedRegionPosts}
          viewMoreHref={followedHref}
          emptyTitle="لا توجد منشورات من ولايات تتابعها"
          emptyDescription="تابع ولايات من إعداداتك لتظهر منشوراتها هنا"
        />

      </div>
    </div>
  )
}

