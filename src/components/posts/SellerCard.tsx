// src/components/posts/SellerCard.tsx
// Server component — no 'use client' needed

import Image from 'next/image'
import Link from 'next/link'

interface Props {
  profile: {
    id: string
    full_name: string
    username: string | null
    avatar_url: string | null
    bio: string | null
    created_at: string
  }
}

function memberSince(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ar-TN', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function SellerCard({ profile }: Props) {
  const profileHref = profile.username
    ? `/profile/${profile.username}`
    : `/profile/${profile.id}`

  return (
    <div className="seller-card">
      <h3 className="seller-card__heading">البائع</h3>

      <div className="seller-card__info">
        {/* Avatar */}
        <div className="seller-card__avatar-wrap">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="56px"
              className="seller-card__avatar"
            />
          ) : (
            <div className="seller-card__avatar-fallback">
              {profile.full_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="seller-card__details">
          <p className="seller-card__name">{profile.full_name}</p>
          <p className="seller-card__since">
            عضو منذ {memberSince(profile.created_at)}
          </p>
        </div>
      </div>

      {profile.bio && (
        <p className="seller-card__bio">{profile.bio}</p>
      )}

      <Link href={profileHref} className="seller-card__link">
        عرض الملف الشخصي
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    </div>
  )
}
