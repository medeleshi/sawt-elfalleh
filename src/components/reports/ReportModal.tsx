// src/components/reports/ReportModal.tsx
'use client'

import { useState, useTransition } from 'react'
import { Flag, X } from 'lucide-react'
import { reportPostAction, reportUserAction } from '@/actions/reports.actions'
import { toast } from '@/components/shared/Toast'

const REPORT_REASONS = [
  'محتوى مضلل أو غير صحيح',
  'سعر مبالغ فيه أو احتيال',
  'منشور مكرر أو سبام',
  'صور مسيئة أو غير لائقة',
  'معلومات تواصل خاطئة',
  'نشاط مشبوه',
  'أخرى',
]

interface Props {
  postId?: string
  reportedUserId?: string
  targetLabel?: string
}

/**
 * Report modal — used for reporting posts or users.
 * Shows ConfirmDialog-style overlay with reason selection.
 * Dispatches toast on success/error.
 */
export default function ReportModal({ postId, reportedUserId, targetLabel }: Props) {
  const [open, setOpen]               = useState(false)
  const [reason, setReason]           = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isPending, startTransition]  = useTransition()
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  const finalReason = reason === 'أخرى' ? customReason.trim() : reason

  function handleClose() {
    if (isPending) return
    setOpen(false)
    setReason('')
    setCustomReason('')
    setSubmitted(false)
    setError('')
  }

  function handleSubmit() {
    if (!finalReason) return
    setError('')

    startTransition(async () => {
      let result: { success: boolean; error?: string }

      if (postId) {
        result = await reportPostAction({ post_id: postId, reason: finalReason })
      } else if (reportedUserId) {
        result = await reportUserAction({ reported_user_id: reportedUserId, reason: finalReason })
      } else {
        return
      }

      if (result.success) {
        setSubmitted(true)
        toast.info('تم إرسال البلاغ. سيقوم فريقنا بمراجعته.')
      } else {
        setError(result.error ?? 'حدث خطأ غير متوقع')
        toast.error(result.error ?? 'فشل إرسال البلاغ')
      }
    })
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="report-trigger"
        aria-label="إبلاغ"
      >
        <Flag className="h-4 w-4" />
        <span>إبلاغ</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="cd-backdrop"
          role="presentation"
          onClick={handleClose}
        >
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="إرسال بلاغ"
            className="report-modal"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="report-modal__header">
              <div className="report-modal__header-left">
                <Flag className="h-5 w-5 text-destructive" />
                <h2 className="report-modal__title">إرسال بلاغ</h2>
              </div>
              <button
                className="cd-close"
                onClick={handleClose}
                aria-label="إغلاق"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="report-modal__body">
              {submitted ? (
                /* ── Success state ── */
                <div className="report-modal__success">
                  <div className="report-modal__success-icon">✅</div>
                  <h3 className="report-modal__success-title">تم إرسال البلاغ</h3>
                  <p className="report-modal__success-desc">
                    سيقوم فريقنا بمراجعة البلاغ في أقرب وقت ممكن.
                  </p>
                  <button
                    onClick={handleClose}
                    className="sys-btn sys-btn--outline"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  {targetLabel && (
                    <p className="report-modal__target">
                      الإبلاغ عن:{' '}
                      <span className="font-semibold text-foreground">{targetLabel}</span>
                    </p>
                  )}

                  <p className="report-modal__label">اختر سبب البلاغ</p>

                  {/* Reason list */}
                  <div className="report-modal__reasons">
                    {REPORT_REASONS.map(r => (
                      <label
                        key={r}
                        className={`report-reason ${reason === r ? 'report-reason--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-destructive"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>

                  {/* Custom reason */}
                  {reason === 'أخرى' && (
                    <textarea
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="اشرح سبب البلاغ بشكل مفصل..."
                      className="report-modal__textarea"
                      autoFocus
                    />
                  )}

                  {error && (
                    <p className="cd-error" role="alert">{error}</p>
                  )}

                  {/* Actions */}
                  <div className="cd-actions">
                    <button
                      onClick={handleClose}
                      className="cd-btn cd-btn--cancel"
                      disabled={isPending}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!finalReason || isPending}
                      className="cd-btn cd-btn--danger"
                    >
                      {isPending && <span className="cd-spinner" aria-hidden />}
                      {isPending ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
