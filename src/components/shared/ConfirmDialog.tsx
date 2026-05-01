// src/components/shared/ConfirmDialog.tsx
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export type ConfirmVariant = 'danger' | 'warning' | 'default'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** danger = red, warning = amber, default = primary green */
  variant?: ConfirmVariant
  isPending?: boolean
  error?: string | null
  /** Optional icon shown next to the title (e.g. '🗑️', '🚩') */
  icon?: string
}

/**
 * Accessible confirmation dialog — shared by DeletePostButton, ReportModal, etc.
 *
 * Features:
 * - Traps focus (confirm button gets focus on open)
 * - Closes on Escape key
 * - Closes on backdrop click (unless isPending)
 * - Prevents body scroll while open
 * - ARIA: role="alertdialog", aria-modal, aria-labelledby, aria-describedby
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'default',
  isPending = false,
  error,
  icon,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, isPending, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const confirmClass = {
    danger:  'cd-btn cd-btn--danger',
    warning: 'cd-btn cd-btn--warning',
    default: 'cd-btn cd-btn--primary',
  }[variant]

  return (
    /* Backdrop */
    <div
      className="cd-backdrop"
      role="presentation"
      onClick={() => { if (!isPending) onClose() }}
    >
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        aria-describedby="cd-desc"
        className="cd-dialog"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close × */}
        <button
          className="cd-close"
          onClick={onClose}
          disabled={isPending}
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="cd-header">
          {icon && <span className="cd-header__icon" aria-hidden="true">{icon}</span>}
          <h2 id="cd-title" className="cd-header__title">{title}</h2>
        </div>

        {/* Description */}
        <p id="cd-desc" className="cd-desc">{description}</p>

        {/* Error */}
        {error && (
          <p className="cd-error" role="alert">{error}</p>
        )}

        {/* Buttons */}
        <div className="cd-actions">
          <button
            className="cd-btn cd-btn--cancel"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={confirmClass}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && (
              <span className="cd-spinner" aria-hidden="true" />
            )}
            {isPending ? 'جاري التنفيذ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
