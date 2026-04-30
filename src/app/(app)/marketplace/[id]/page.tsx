// src/app/(app)/marketplace/[id]/page.tsx

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  getPostDetails,
  getSimilarPosts,
  trackPostView,
} from '@/lib/queries/post-details'
import { formatPrice, formatQuantity, formatRelativeTime, formatDate } from '@/lib/utils/format'
import { POST_TYPE_LABELS, POST_STATUS_LABELS, ROUTES } from '@/lib/utils/constants'
import PostImageSlider from '@/components/posts/PostImageSlider'
import SellerCard from '@/components/posts/SellerCard'
import ContactModal from '@/components/posts/ContactModal'
import SimilarPosts from '@/components/posts/SimilarPosts'
import Link from 'next/link'

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await getPostDetails(params.id)
  if (!post) return { title: 'منشور غير موجود' }

  const categoryName = post.category?.name_ar ?? ''
  const regionName = post.region?.name_ar ?? ''
  const priceStr =
    post.price === 0 ? 'سعر قابل للتفاوض' : `${post.price} د.ت`

  return {
    title: `${post.title} — ${categoryName} · ${regionName}`,
    description: `${post.description?.slice(0, 150) ?? ''} | ${priceStr} | ${formatQuantity(post.quantity, post.unit?.symbol ?? '')}`,
    openGraph: {
      title: post.title,
      description: post.description ?? undefined,
      images: post.post_images[0]
        ? [{ url: post.post_images[0].url }]
        : undefined,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PostDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch post
  const post = await getPostDetails(params.id)
  if (!post) notFound()

  // Fetch viewer (for view tracking)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Track view — fire-and-forget (don't block render)
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  // Simple hash for privacy (no crypto needed for basic analytics)
  const ipHash = ip
    ? Buffer.from(ip).toString('base64').slice(0, 16)
    : null

  trackPostView(post.id, user?.id ?? null, ipHash).catch(() => {})

  // Fetch similar posts
  const similarPosts = await getSimilarPosts(
    post.category_id,
    post.region_id,
    post.id,
    8
  )

  const isSell = post.type === 'sell'
  const isExpired = post.status !== 'active'
  const canContact =
    !isExpired &&
    post.profiles?.show_phone &&
    post.profiles?.phone &&
    user?.id !== post.user_id

  // Is this post owned by the current user?
  const isOwner = user?.id === post.user_id

  return (
    <div className="post-details-page">
      {/* ── Breadcrumb ── */}
      <nav className="post-details__breadcrumb" aria-label="مسار التنقل">
        <Link href={ROUTES.MARKETPLACE}>السوق</Link>
        <span className="post-details__breadcrumb-sep">›</span>
        {post.category && (
          <>
            <Link href={`${ROUTES.MARKETPLACE}?category_id=${post.category.id}`}>
              {post.category.icon} {post.category.name_ar}
            </Link>
            <span className="post-details__breadcrumb-sep">›</span>
          </>
        )}
        <span className="post-details__breadcrumb-current">{post.title}</span>
      </nav>

      {/* ── Status banner for non-active posts ── */}
      {isExpired && (
        <div className="post-details__status-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          هذا الإعلان {POST_STATUS_LABELS[post.status] ?? post.status} وغير متاح للتواصل حالياً.
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="post-details__layout">
        {/* ── LEFT: Images + Details ── */}
        <div className="post-details__main">
          {/* Image slider */}
          <PostImageSlider images={post.post_images} title={post.title} />

          {/* Post meta on mobile — shown before description */}
          <div className="post-details__meta-mobile">
            <PostMetaBadges post={post} isSell={isSell} />
          </div>

          {/* Description */}
          {post.description && (
            <div className="post-details__description-box">
              <h2 className="post-details__section-title">الوصف</h2>
              <p className="post-details__description">{post.description}</p>
            </div>
          )}

          {/* Details table */}
          <div className="post-details__info-table">
            <h2 className="post-details__section-title">تفاصيل الإعلان</h2>
            <dl className="post-details__dl">
              <div className="post-details__dl-row">
                <dt>النوع</dt>
                <dd>
                  <span className={`type-badge ${isSell ? 'type-badge--sell' : 'type-badge--buy'}`}>
                    {POST_TYPE_LABELS[post.type]}
                  </span>
                </dd>
              </div>

              {post.category && (
                <div className="post-details__dl-row">
                  <dt>الصنف</dt>
                  <dd>{post.category.icon} {post.category.name_ar}</dd>
                </div>
              )}

              <div className="post-details__dl-row">
                <dt>الكمية</dt>
                <dd>
                  {formatQuantity(post.quantity, post.unit?.symbol ?? post.unit?.name_ar ?? '')}
                </dd>
              </div>

              <div className="post-details__dl-row">
                <dt>السعر</dt>
                <dd className="post-details__dl-price">
                  {post.price === 0
                    ? 'سعر قابل للتفاوض'
                    : formatPrice(post.price)}
                  {post.is_negotiable && post.price > 0 && (
                    <span className="negotiable-tag">قابل للتفاوض</span>
                  )}
                </dd>
              </div>

              {post.region && (
                <div className="post-details__dl-row">
                  <dt>الولاية</dt>
                  <dd>
                    <Link
                      href={`${ROUTES.MARKETPLACE}?region_id=${post.region_id}`}
                      className="post-details__dl-link"
                    >
                      {post.region.name_ar}
                    </Link>
                  </dd>
                </div>
              )}

              {post.city && (
                <div className="post-details__dl-row">
                  <dt>المدينة</dt>
                  <dd>{post.city}</dd>
                </div>
              )}

              <div className="post-details__dl-row">
                <dt>تاريخ النشر</dt>
                <dd>
                  {formatDate(post.created_at)}
                  <span className="post-details__dl-relative">
                    ({formatRelativeTime(post.created_at)})
                  </span>
                </dd>
              </div>

              <div className="post-details__dl-row">
                <dt>صلاحية الإعلان</dt>
                <dd>{formatDate(post.expires_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="post-details__sidebar">
          {/* Post title + badges (desktop) */}
          <div className="post-details__sidebar-header">
            <div className="post-details__badges-row">
              <span className={`type-badge ${isSell ? 'type-badge--sell' : 'type-badge--buy'}`}>
                {POST_TYPE_LABELS[post.type]}
              </span>
              {post.category && (
                <span className="post-details__category-chip">
                  {post.category.icon} {post.category.name_ar}
                </span>
              )}
            </div>

            <h1 className="post-details__title">{post.title}</h1>

            <div className="post-details__price-block">
              {post.price === 0 ? (
                <p className="post-details__price post-details__price--negotiable">
                  سعر قابل للتفاوض
                </p>
              ) : (
                <p className="post-details__price">
                  {formatPrice(post.price)}
                  <span className="post-details__per-unit">
                    / {post.unit?.symbol ?? post.unit?.name_ar}
                  </span>
                </p>
              )}
              {post.is_negotiable && post.price > 0 && (
                <span className="negotiable-tag">قابل للتفاوض</span>
              )}
            </div>

            <p className="post-details__quantity-row">
              الكمية المتاحة:{' '}
              <strong>
                {formatQuantity(post.quantity, post.unit?.symbol ?? post.unit?.name_ar ?? '')}
              </strong>
            </p>

            {/* Location */}
            {post.region && (
              <p className="post-details__location-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {post.region.name_ar}
                {post.city ? ` — ${post.city}` : ''}
              </p>
            )}
          </div>

          {/* Contact CTA */}
          <div className="post-details__cta-box">
            {canContact && post.profiles?.phone ? (
              <ContactModal
                postId={post.id}
                phone={post.profiles.phone}
                sellerName={post.profiles.full_name}
              />
            ) : isOwner ? (
              <Link
                href={`/post/${post.id}/edit`}
                className="btn-edit-own"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                تعديل إعلانك
              </Link>
            ) : isExpired ? (
              <p className="post-details__cta-disabled">
                هذا الإعلان لم يعد نشطاً
              </p>
            ) : !post.profiles?.show_phone ? (
              <p className="post-details__cta-disabled">
                البائع اختار عدم إظهار رقمه
              </p>
            ) : !user ? (
              <Link href="/login" className="btn-contact-trigger">
                سجّل الدخول للتواصل
              </Link>
            ) : null}
          </div>

          {/* Seller card */}
          {post.profiles && (
            <SellerCard
              seller={{
                ...post.profiles,
                region: post.region,
              }}
            />
          )}

          {/* Report link */}
          {user && !isOwner && (
            <div className="post-details__report">
              <button className="post-details__report-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                الإبلاغ عن هذا الإعلان
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* ── Similar posts ── */}
      <SimilarPosts posts={similarPosts} />
    </div>
  )
}

// ─── PostMetaBadges — mobile-only helper ──────────────────────────────────────

function PostMetaBadges({
  post,
  isSell,
}: {
  post: Awaited<ReturnType<typeof getPostDetails>>
  isSell: boolean
}) {
  if (!post) return null
  return (
    <div className="post-details__mobile-meta">
      <div className="post-details__badges-row">
        <span className={`type-badge ${isSell ? 'type-badge--sell' : 'type-badge--buy'}`}>
          {POST_TYPE_LABELS[post.type]}
        </span>
        {post.category && (
          <span className="post-details__category-chip">
            {post.category.icon} {post.category.name_ar}
          </span>
        )}
      </div>
      <h1 className="post-details__title">{post.title}</h1>
      <p className="post-details__price">
        {post.price === 0
          ? 'سعر قابل للتفاوض'
          : `${formatPrice(post.price)} / ${post.unit?.symbol ?? ''}`}
      </p>
    </div>
  )
}
