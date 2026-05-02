// src/app/(app)/marketplace/page.tsx

import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { getMarketplacePosts, getMarketplaceCatalog } from '@/lib/queries/marketplace';
import type { MarketplaceFilters as MarketplaceFiltersType } from '@/types/marketplace';

import PostCard from '@/components/posts/PostCard';
import PostGrid from '@/components/posts/PostGrid';
import MarketplaceFilters from '@/components/posts/MarketplaceFilters';
import MarketplaceSearchBar from '@/components/posts/MarketplaceSearchBar';
import MobileFiltersToggle from '@/components/posts/MobileFiltersToggle';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';

export const metadata: Metadata = {
  title: 'سوق الفلاحة | صوت الفلاح',
  description: 'تصفح آلاف إعلانات بيع وشراء المنتجات الفلاحية في تونس — مواشي، حبوب، خضروات، فواكه وأكثر',
};

// Force dynamic rendering so filters always reflect URL
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] ?? '';
  return val ?? '';
}

function countActiveFilters(filters: MarketplaceFiltersType): number {
  return [
    filters.type,
    filters.category_id,
    filters.region_id,
    filters.unit_id,
    filters.price_min,
    filters.price_max,
    filters.is_negotiable,
    filters.query,
  ].filter(Boolean).length;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: MarketplaceFiltersType = {
    query: normalizeParam(params.query),
    type: normalizeParam(params.type) as MarketplaceFiltersType['type'],
    category_id: normalizeParam(params.category_id),
    region_id: normalizeParam(params.region_id),
    unit_id: normalizeParam(params.unit_id),
    price_min: normalizeParam(params.price_min),
    price_max: normalizeParam(params.price_max),
    is_negotiable: normalizeParam(params.is_negotiable),
    sort: (normalizeParam(params.sort) || 'newest') as MarketplaceFiltersType['sort'],
    page: normalizeParam(params.page) || '1',
  };

  // Fetch in parallel
  const [{ posts, pagination }, { categories, regions, units }] = await Promise.all([
    getMarketplacePosts(filters),
    getMarketplaceCatalog(),
  ]);

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="marketplace-page" dir="rtl">
      {/* ── Page Header ── */}
      <div className="marketplace-header">
        <div className="marketplace-header__content">
          <h1 className="marketplace-header__title">
            <span className="marketplace-header__icon">🌾</span>
            سوق الفلاحة
          </h1>
          <p className="marketplace-header__subtitle">
            {pagination.total > 0
              ? `${pagination.total.toLocaleString('ar-TN')} إعلان متاح`
              : 'تصفح إعلانات البيع والشراء'}
          </p>
        </div>

        <Link href="/post/new" className="btn-primary marketplace-header__cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          أضف إعلانك
        </Link>
      </div>

      {/* ── Search + Sort Bar ── */}
      <div className="marketplace-search-row">
        <Suspense>
          <MarketplaceSearchBar />
        </Suspense>
      </div>

      {/* ── Layout: Filters sidebar + Grid ── */}
      <div className="marketplace-layout">

        {/* Desktop sidebar */}
        <div className="marketplace-sidebar">
          <Suspense>
            <MarketplaceFilters
              categories={categories}
              regions={regions}
              units={units}
            />
          </Suspense>
        </div>

        {/* Main content */}
        <main className="marketplace-main">

          {/* Mobile filter toggle */}
          <div className="marketplace-mobile-bar">
            <Suspense>
              <MobileFiltersToggle
                categories={categories}
                regions={regions}
                units={units}
                activeCount={activeFilterCount}
              />
            </Suspense>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="active-filter-chips">
                {filters.query && (
                  <span className="filter-chip">بحث: {filters.query}</span>
                )}
                {filters.type && (
                  <span className="filter-chip">
                    {filters.type === 'sell' ? 'بيع' : 'شراء'}
                  </span>
                )}
                {filters.category_id && (
                  <span className="filter-chip">
                    {categories.find((c) => c.id === filters.category_id)?.name_ar}
                  </span>
                )}
                {filters.region_id && (
                  <span className="filter-chip">
                    {regions.find((r) => r.id === filters.region_id)?.name_ar}
                  </span>
                )}
                {(filters.price_min || filters.price_max) && (
                  <span className="filter-chip">
                    السعر: {filters.price_min || '0'} — {filters.price_max || '∞'} د.ت
                  </span>
                )}
                {filters.is_negotiable === 'true' && (
                  <span className="filter-chip">قابل للتفاوض</span>
                )}
              </div>
            )}
          </div>

          {/* ── Posts Grid ── */}
          {posts.length === 0 ? (
            <EmptyState
              title="لا توجد إعلانات"
              description={
                activeFilterCount > 0
                  ? 'لا توجد إعلانات تطابق الفلاتر المختارة. جرّب تعديل معايير البحث.'
                  : 'لا توجد إعلانات نشطة حالياً. كن أول من ينشر!'
              }
              icon="🌾"
              action={
                <Link href="/post/new" className="btn-primary">
                  أضف إعلانك الآن
                </Link>
              }
            />
          ) : (
            <>
              <PostGrid 
                posts={posts} 
                className="posts-grid"
              />

              {/* ── Pagination ── */}
              <Suspense>
                <Pagination pagination={pagination} />
              </Suspense>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
