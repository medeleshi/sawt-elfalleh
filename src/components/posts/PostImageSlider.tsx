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
}

export default function PostImageSlider({ images, title }: Props) {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => {
    setActive((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const next = useCallback(() => {
    setActive((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="post-slider post-slider--empty">
        <span className="post-slider__placeholder-icon">📦</span>
        <p className="post-slider__placeholder-text">لا توجد صور</p>
      </div>
    )
  }

  return (
    <div className="post-slider">
      {/* Main image */}
      <div className="post-slider__main">
        <Image
          src={images[active].url}
          alt={`${title} — صورة ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="post-slider__main-img"
          priority={active === 0}
        />

        {/* Counter */}
        <span className="post-slider__counter">
          {active + 1} / {images.length}
        </span>

        {/* Arrows — only if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="post-slider__arrow post-slider__arrow--prev"
              aria-label="الصورة السابقة"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="post-slider__arrow post-slider__arrow--next"
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
      {images.length > 1 && (
        <div className="post-slider__thumbs">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`post-slider__thumb ${i === active ? 'post-slider__thumb--active' : ''}`}
              aria-label={`عرض الصورة ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`صورة مصغرة ${i + 1}`}
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
