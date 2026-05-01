// src/app/(app)/marketplace/[id]/page.tsx
// Server Component — fetches data server-side, passes to client components

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

import { getPostById, getSimilarPosts, getCurrentUserId } from '@/lib/queries/post-details.queries'
import { recordPostView } from '@/actions/analytics.actions'
import { formatPrice, formatQuantity, formatRelativeTime, formatDate } from '@/lib/utils/format'

import PostImageSlider from '@/components/posts/PostImageSlider'
import PostContactSection from '@/components/posts/PostContactSection'
import SellerCard from '@/components/posts/SellerCard'
import SimilarPosts from '@/components/posts/SimilarPosts'
import ReportModal from '@/components/reports/ReportModal'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await getPostById(params.id)

  if (!post) {
    return { title: 'إعلان غير موجود — صوت الفلاح' }
  }

  const category = (post as any).category?.name_ar ?? ''
  const region = (post as any).region?.name_ar ?? ''
  const price = post.price > 0 ? formatPrice(post.price) : 'سعر قابل للتفاوض'

  return {
    title: `${post.title} — ${category} في ${region} | صوت الفلاح`,
    description: `${post.description?.slice(0, 140) ?? post.title} — السعر: ${price}`,
    openGraph: {
      title: post.title,
      description: post.description ?? post.title,
      images: (post as any).post_images?.[0]?.url
        ? [{ url: (post as any).post_images[0].url }]
        : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PostDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch in parallel
  const [post, currentUserId] = await Promise.all([
    getPostById(params.id),
    getCurrentUserId(),
  ])

  if (!post) notFound()

  const profile = (post as any).profiles
  const category = (post as any).category
  const region = (post as any).region
  const unit = (post as any).unit
  const images = (post as any).post_images ?? []

  // Fetch similar posts (after we know category/region)
  const similarPosts = await getSimilarPosts(
    post.category_id,
    post.region_id,
    post.id
  )

  // Record view — fire and forget (non-blocking)
  recordPostView(post.id, currentUserId)

  const isSell = post.type === 'sell'
  const isExpired = post.status !== 'active'
  const isOwnPost = currentUserId && profile?.id === currentUserId

  return (
    <div className="post-details-page">
      {/* Breadcrumb */}
      <nav className="post-details__breadcrumb" aria-label="مسار التنقل">
        <Link href="/" className="breadcrumb__link">الرئيسية</Link>
        <span className="breadcrumb__sep">›</span>
        <Link href="/marketplace" className="breadcrumb__link">السوق</Link>
        <span className="breadcrumb__sep">›</span>
        <span className="breadcrumb__current">{post.title}</span>
      </nav>

      {/* Expired banner */}
      {isExpired && (
        <div className="post-details__expired-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          هذا الإعلان لم يعد متاحاً
        </div>
      )}

      <div className="post-details__layout">
        {/* ── Left column: images + similar ── */}
        <div className="post-details__left">
          <PostImageSlider
            images={images}
            title={post.title}
            categoryIcon={category?.icon}
          />
        </div>

        {/* ── Right column: info + seller + contact ── */}
        <div className="post-details__right">
          {/* Type + Category badges */}
          <div className="post-details__badges">
            <span className={`post-badge post-badge--type ${isSell ? 'post-badge--sell' : 'post-badge--buy'}`}>
              {isSell ? 'بيع' : 'شراء'}
            </span>
            {category && (
              <span className="post-badge post-badge--category">
                {category.icon} {category.name_ar}
              </span>
            )}
            {post.is_negotiable && (
              <span className="post-badge post-badge--negotiable">قابل للتفاوض</span>
            )}
          </div>

          {/* Title */}
          <h1 className="post-details__title">{post.title}</h1>

          {/* Price */}
          <div className="post-details__price-block">
            {post.price > 0 ? (
              <span className="post-details__price">{formatPrice(post.price)}</span>
            ) : (
              <span className="post-details__price post-details__price--negotiable">
                سعر قابل للتفاوض
              </span>
            )}
          </div>

          {/* Key details grid */}
          <dl className="post-details__meta">
            <div className="post-details__meta-item">
              <dt className="post-details__meta-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                الكمية
              </dt>
              <dd className="post-details__meta-value">
                {formatQuantity(post.quantity, unit?.symbol ?? unit?.name_ar ?? '')}
              </dd>
            </div>

            <div className="post-details__meta-item">
              <dt className="post-details__meta-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                الموقع
              </dt>
              <dd className="post-details__meta-value">
                {region?.name_ar}
                {post.city ? ` · ${post.city}` : ''}
              </dd>
            </div>

            <div className="post-details__meta-item">
              <dt className="post-details__meta-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                تاريخ النشر
              </dt>
              <dd className="post-details__meta-value">
                {formatDate(post.created_at)}
                <span className="post-details__meta-ago"> ({formatRelativeTime(post.created_at)})</span>
              </dd>
            </div>

            {post.expires_at && (
              <div className="post-details__meta-item">
                <dt className="post-details__meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  ينتهي في
                </dt>
                <dd className="post-details__meta-value">{formatDate(post.expires_at)}</dd>
              </div>
            )}
          </dl>

          {/* Description */}
          {post.description && (
            <div className="post-details__description">
              <h2 className="post-details__description-title">تفاصيل الإعلان</h2>
              <p className="post-details__description-body">{post.description}</p>
            </div>
          )}

          {/* Contact section */}
          {!isExpired && profile && (
            <PostContactSection
              postId={post.id}
              phone={profile.phone ?? ''}
              showPhone={profile.show_phone}
              sellerName={profile.full_name}
              currentUserId={currentUserId}
            />
          )}

          {/* Seller card */}
          {profile && (
            <SellerCard profile={profile} />
          )}

          {/* Report section — hidden for post owner */}
          {!isOwnPost && (
            <div className="post-details__report">
              <ReportModal
                postId={post.id}
                targetLabel={post.title}
              />
            </div>
          )}
        </div>
      </div>

      {/* Similar posts — full width below layout */}
      {similarPosts.length > 0 && (
        <SimilarPosts
          posts={similarPosts as any}
          categoryName={category?.name_ar ?? ''}
        />
      )}
    </div>
  )
}
