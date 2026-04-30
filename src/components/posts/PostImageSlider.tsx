'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface PostImage {
  id: string
  url: string
  sort_order: number
}

interface Props {
  images: PostImage[]
  title: string
  categoryIcon?: string | null
}

export default function PostImageSlider({ images, title, categoryIcon }: Props) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const [active, setActive] = useState(0)

  const prev = useCallback(() => {
    setActive(i => (i === 0 ? sorted.length - 1 : i - 1))
  }, [sorted.length])

  const next = useCallback(() => {
    setActive(i => (i === sorted.length - 1 ? 0 : i + 1))
  }, [sorted.length])

  // No images — show placeholder
  if (sorted.length === 0) {
    return (
      <div className="post-slider post-slider--empty">
        <span className="post-slider__placeholder-icon">{categoryIcon ?? '📦'}</span>
        <p className="post-slider__placeholder-text">لا توجد صور</p>
      </div>
    )
  }

  return (
    <div className="post-slider">
      {/* Main image */}
      <div className="post-slider__main">
        <Image
          src={sorted[active].url}
          alt={`${title} — صورة ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="post-slider__img"
          priority={active === 0}
        />

        {/* Counter badge */}
        <span className="post-slider__counter">
          {active + 1} / {sorted.length}
        </span>

        {/* Navigation arrows (only if >1 image) */}
        {sorted.length > 1 && (
          <>
            <button
              className="post-slider__arrow post-slider__arrow--prev"
              onClick={prev}
              aria-label="الصورة السابقة"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              className="post-slider__arrow post-slider__arrow--next"
              onClick={next}
              aria-label="الصورة التالية"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="post-slider__thumbs">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              className={`post-slider__thumb ${idx === active ? 'post-slider__thumb--active' : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`الصورة ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={`${title} — صورة ${idx + 1}`}
                fill
                sizes="80px"
                className="post-slider__thumb-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
