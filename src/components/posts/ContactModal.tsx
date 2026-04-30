'use client'

import { useState, useEffect, useCallback } from 'react'
import { trackContactAction } from '@/actions/contact.actions'

interface Props {
  postId: string
  phone: string
  sellerName: string
}

export default function ContactModal({ postId, phone, sellerName }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handlePhoneClick = useCallback(async () => {
    await trackContactAction(postId, 'phone')
    window.location.href = `tel:${phone}`
  }, [postId, phone])

  const handleWhatsAppClick = useCallback(async () => {
    await trackContactAction(postId, 'whatsapp')
    const cleaned = phone.replace(/\D/g, '')
    const intl = cleaned.startsWith('216') ? cleaned : `216${cleaned}`
    window.open(`https://wa.me/${intl}`, '_blank', 'noopener,noreferrer')
  }, [postId, phone])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('input')
      el.value = phone
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [phone])

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="btn-contact-trigger"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.98 5.98l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        تواصل مع البائع
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="contact-modal-overlay"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          {/* Modal */}
          <div
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-label="تواصل مع البائع"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="contact-modal__header">
              <div className="contact-modal__header-info">
                <div className="contact-modal__avatar-circle">
                  {sellerName.charAt(0)}
                </div>
                <div>
                  <p className="contact-modal__seller-label">التواصل مع البائع</p>
                  <p className="contact-modal__seller-name">{sellerName}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="contact-modal__close"
                aria-label="إغلاق"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Phone display */}
            <div className="contact-modal__phone-box">
              <p className="contact-modal__phone-label">رقم الهاتف</p>
              <p className="contact-modal__phone-number" dir="ltr">{phone}</p>
            </div>

            {/* Actions */}
            <div className="contact-modal__actions">
              {/* Call */}
              <button
                onClick={handlePhoneClick}
                className="contact-modal__btn contact-modal__btn--phone"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.98 5.98l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                اتصال هاتفي
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppClick}
                className="contact-modal__btn contact-modal__btn--whatsapp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.851L0 24l6.335-1.509A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 0 1-5.034-1.39l-.36-.214-3.732.888.921-3.618-.236-.373A9.777 9.777 0 0 1 2.182 12C2.182 6.574 6.574 2.182 12 2.182S21.818 6.574 21.818 12 17.426 21.818 12 21.818z" />
                </svg>
                واتساب
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className={`contact-modal__btn contact-modal__btn--copy ${copied ? 'contact-modal__btn--copied' : ''}`}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    نسخ الرقم
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="contact-modal__disclaimer">
              يُرجى التثبت من هوية البائع قبل إتمام أي معاملة.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
