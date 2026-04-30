'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ContactModal = dynamic(() => import('./ContactModal'), { ssr: false })

interface Props {
  postId: string
  phone: string
  showPhone: boolean
  sellerName: string
  currentUserId: string | null
}

export default function PostContactSection({
  postId,
  phone,
  showPhone,
  sellerName,
  currentUserId,
}: Props) {
  const [open, setOpen] = useState(false)

  if (!showPhone || !phone) {
    return (
      <div className="contact-section contact-section--hidden">
        <p className="contact-section__hidden-msg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          البائع أخفى رقم هاتفه
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="contact-section">
        <button
          className="contact-section__btn"
          onClick={() => setOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          تواصل مع البائع
        </button>
      </div>

      {open && (
        <ContactModal
          postId={postId}
          phone={phone}
          sellerName={sellerName}
          currentUserId={currentUserId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
