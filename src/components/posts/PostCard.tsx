// src/components/posts/PostCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { PostCard as PostCardType } from '@/types/marketplace';

function formatPrice(price: number): string {
  return price === 0 ? 'سعر قابل للتفاوض' : `${price.toLocaleString('ar-TN')} د.ت`;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-TN');
}

interface Props {
  post: PostCardType;
}

export default function PostCard({ post }: Props) {
  const coverImage = post.post_images
    ?.sort((a, b) => a.sort_order - b.sort_order)
    .at(0);

  const isSell = post.type === 'sell';

  return (
    <Link
      href={`/marketplace/${post.id}`}
      className="post-card group block"
      aria-label={post.title}
    >
      {/* Image */}
      <div className="post-card__image-wrap">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="post-card__image"
          />
        ) : (
          <div className="post-card__image-placeholder">
            <span className="text-4xl">{post.category?.icon ?? '📦'}</span>
          </div>
        )}

        {/* Type badge */}
        <span className={`post-card__type-badge ${isSell ? 'badge--sell' : 'badge--buy'}`}>
          {isSell ? 'بيع' : 'شراء'}
        </span>

        {/* Negotiable badge */}
        {post.is_negotiable && (
          <span className="post-card__negotiable-badge">قابل للتفاوض</span>
        )}
      </div>

      {/* Body */}
      <div className="post-card__body">
        {/* Category */}
        <div className="post-card__category">
          <span>{post.category?.icon}</span>
          <span>{post.category?.name_ar}</span>
        </div>

        {/* Title */}
        <h3 className="post-card__title">{post.title}</h3>

        {/* Quantity + Unit */}
        <p className="post-card__quantity">
          {post.quantity} {post.unit?.symbol ?? post.unit?.name_ar}
        </p>

        {/* Price */}
        <p className={`post-card__price ${post.price === 0 ? 'price--negotiable' : ''}`}>
          {formatPrice(post.price)}
        </p>

        {/* Footer */}
        <div className="post-card__footer">
          <span className="post-card__location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {post.region?.name_ar}
            {post.city ? ` · ${post.city}` : ''}
          </span>
          <span className="post-card__time">{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
