'use client'

import { useEffect, useCallback, useState } from 'react'
import { recordPostContact } from '@/actions/analytics.actions'

interface Props {
  postId: string
  phone: string
  sellerName: string
  currentUserId: string | null
  onClose: () => void
}

export default function ContactModal({
  postId,
  phone,
  sellerName,
  currentUserId,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Trap body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePhone = useCallback(async () => {
    await recordPostContact(postId, 'phone', currentUserId)
    window.location.href = `tel:${phone}`
  }, [postId, phone, currentUserId])

  const handleWhatsApp = useCallback(async () => {
    await recordPostContact(postId, 'whatsapp', currentUserId)
    const cleanPhone = phone.replace(/\s+/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer')
  }, [postId, phone, currentUserId])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [phone])

  return (
    <div className="contact-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="تواصل مع البائع">
      <div className="contact-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="contact-modal__header">
          <div>
            <h2 className="contact-modal__title">تواصل مع البائع</h2>
            <p className="contact-modal__seller">{sellerName}</p>
          </div>
          <button className="contact-modal__close" onClick={onClose} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Phone display */}
        <div className="contact-modal__phone-box">
          <span className="contact-modal__phone-icon">📞</span>
          <span className="contact-modal__phone-number" dir="ltr">{phone}</span>
        </div>

        {/* Action buttons */}
        <div className="contact-modal__actions">
          {/* Call */}
          <a
            href={`tel:${phone}`}
            className="contact-modal__btn contact-modal__btn--call"
            onClick={handlePhone}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            اتصل الآن
          </a>

          {/* WhatsApp */}
          <button
            className="contact-modal__btn contact-modal__btn--whatsapp"
            onClick={handleWhatsApp}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            واتساب
          </button>

          {/* Copy */}
          <button
            className="contact-modal__btn contact-modal__btn--copy"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                تم النسخ!
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                نسخ الرقم
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="contact-modal__note">
          تواصل مباشرة مع البائع — المنصة لا تتدخل في المعاملات
        </p>
      </div>
    </div>
  )
}
