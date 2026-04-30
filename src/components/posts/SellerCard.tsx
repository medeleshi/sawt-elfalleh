// src/components/posts/SellerCard.tsx
// Server component — no 'use client' needed

import Image from 'next/image'
import Link from 'next/link'
import { ROLE_LABELS } from '@/lib/utils/constants'
import { formatDate } from '@/lib/utils/format'

interface Props {
  seller: {
    id: string
    full_name: string
    username: string | null
    avatar_url: string | null
    role: string
    region_id: string | null
    city: string | null
    bio: string | null
    created_at: string
    region?: { name_ar: string } | null
  }
}

export default function SellerCard({ seller }: Props) {
  const profileHref = seller.username
    ? `/profile/${seller.username}`
    : `/profile/${seller.id}`

  const roleLabel = ROLE_LABELS[seller.role] ?? seller.role

  return (
    <div className="seller-card">
      <div className="seller-card__header">
        <p className="seller-card__section-label">البائع</p>
      </div>

      <div className="seller-card__body">
        {/* Avatar */}
        <Link href={profileHref} className="seller-card__avatar-link">
          {seller.avatar_url ? (
            <Image
              src={seller.avatar_url}
              alt={seller.full_name}
              width={56}
              height={56}
              className="seller-card__avatar"
            />
          ) : (
            <div className="seller-card__avatar-placeholder">
              {seller.full_name.charAt(0)}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="seller-card__info">
          <Link href={profileHref} className="seller-card__name">
            {seller.full_name}
          </Link>
          <span className="seller-card__role-badge">{roleLabel}</span>

          {/* Location */}
          {(seller.city || seller.region_id) && (
            <p className="seller-card__location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {seller.city ?? ''}
            </p>
          )}

          {/* Member since */}
          <p className="seller-card__since">
            عضو منذ {formatDate(seller.created_at)}
          </p>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <p className="seller-card__bio">{seller.bio}</p>
      )}

      {/* View profile CTA */}
      <Link href={profileHref} className="seller-card__profile-link">
        عرض الملف الشخصي
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    </div>
  )
}
