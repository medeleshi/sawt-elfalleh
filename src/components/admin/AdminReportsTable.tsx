'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateReportStatusAction,
  suspendPostAction,
} from '@/actions/reports.actions'
import { CheckCircle, XCircle, Ban, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

interface Report {
  id: string
  reason: string
  status: string
  admin_note: string | null
  created_at: string
  post_id: string | null
  reported_user_id: string | null
  reporter: { id: string; full_name: string; username: string | null } | null
  post: { id: string; title: string; status: string } | null
  reported_user: { id: string; full_name: string; username: string | null } | null
}

interface Props {
  reports: Report[]
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  reviewed:  'bg-green-100 text-green-700',
  dismissed: 'bg-stone-100 text-stone-500',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'معلّق',
  reviewed:  'تمت المراجعة',
  dismissed: 'مرفوض',
}

function ReportRow({ report }: { report: Report }) {
  const [status, setStatus] = useState(report.status)
  const [postStatus, setPostStatus] = useState(report.post?.status ?? '')
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState(report.admin_note ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleUpdateStatus = (newStatus: 'reviewed' | 'dismissed') => {
    startTransition(async () => {
      const result = await updateReportStatusAction({
        report_id: report.id,
        status: newStatus,
        admin_note: note || undefined,
      })
      if (result.success) {
        setStatus(newStatus)
        setExpanded(false)
      } else {
        setError(result.error)
      }
    })
  }

  const handleSuspendPost = () => {
    if (!report.post_id) return
    startTransition(async () => {
      const result = await suspendPostAction(report.post_id!)
      if (result.success) setPostStatus('suspended')
      else setError(result.error)
    })
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      {/* Header Row */}
      <div className="flex items-start gap-4 p-4">
        {/* Target */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_COLORS[status] ?? 'bg-stone-100'}`}>
              {STATUS_LABELS[status] ?? status}
            </span>
            {report.post_id ? (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                بلاغ عن منشور
              </span>
            ) : (
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-medium">
                بلاغ عن مستخدم
              </span>
            )}
          </div>

          {/* Post target */}
          {report.post && (
            <div className="flex items-center gap-1.5 text-sm mb-1">
              <span className="text-stone-500">المنشور:</span>
              <span className="font-medium text-stone-800 truncate max-w-[200px]">
                {report.post.title}
              </span>
              {postStatus === 'suspended' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">موقوف</span>
              )}
              <Link
                href={`/marketplace/${report.post.id}`}
                target="_blank"
                className="text-stone-400 hover:text-stone-600"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* User target */}
          {report.reported_user && (
            <div className="flex items-center gap-1.5 text-sm mb-1">
              <span className="text-stone-500">المستخدم:</span>
              <span className="font-medium text-stone-800">
                {report.reported_user.full_name}
              </span>
              {report.reported_user.username && (
                <Link
                  href={`/profile/${report.reported_user.username}`}
                  target="_blank"
                  className="text-stone-400 hover:text-stone-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Reporter + Date */}
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span>
              أبلغ عنه: <span className="text-stone-600">{report.reporter?.full_name ?? '—'}</span>
            </span>
            <span>·</span>
            <span>{new Date(report.created_at).toLocaleDateString('ar-TN')}</span>
          </div>

          {/* Reason preview */}
          <p className="text-sm text-stone-600 mt-2 line-clamp-2">{report.reason}</p>
        </div>

        {/* Toggle expand */}
        {status === 'pending' && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded action panel */}
      {expanded && status === 'pending' && (
        <div className="border-t border-stone-100 bg-stone-50 p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              ملاحظة المدير (اختياري)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-white"
              placeholder="أضف ملاحظة داخلية..."
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleUpdateStatus('reviewed')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              تمت المراجعة
            </button>

            <button
              onClick={() => handleUpdateStatus('dismissed')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-300 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              رفض البلاغ
            </button>

            {report.post_id && postStatus !== 'suspended' && (
              <button
                onClick={handleSuspendPost}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                <Ban className="w-4 h-4" />
                إيقاف المنشور
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin note display (for reviewed/dismissed) */}
      {status !== 'pending' && report.admin_note && (
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-3">
          <p className="text-xs text-stone-500">
            <span className="font-semibold">ملاحظة: </span>
            {report.admin_note}
          </p>
        </div>
      )}
    </div>
  )
}

export default function AdminReportsTable({ reports }: Props) {
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} />
      ))}
    </div>
  )
}
