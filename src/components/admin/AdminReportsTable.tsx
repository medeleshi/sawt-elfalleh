'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateReportStatusAction,
  suspendPostAction,
} from '@/actions/reports.actions'
import { 
  CheckCircle2, 
  XCircle, 
  Ban, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  User, 
  FileText, 
  Clock,
  AlertTriangle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { 
    label: 'معلّق', 
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: Clock
  },
  reviewed: { 
    label: 'تمت المراجعة', 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: ShieldCheck
  },
  dismissed: { 
    label: 'مرفوض', 
    color: 'bg-slate-50 text-slate-500 border-slate-100',
    icon: XCircle
  },
}

function ReportRow({ report }: { report: Report }) {
  const [status, setStatus] = useState(report.status)
  const [postStatus, setPostStatus] = useState(report.post?.status ?? '')
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState(report.admin_note ?? '')
  const [isPending, startTransition] = useTransition()

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
        toast.success(newStatus === 'reviewed' ? 'تمت مراجعة البلاغ' : 'تم رفض البلاغ')
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSuspendPost = () => {
    if (!report.post_id) return
    if (!confirm('هل أنت متأكد من رغبتك في إيقاف هذا المنشور؟')) return
    
    startTransition(async () => {
      const result = await suspendPostAction(report.post_id!)
      if (result.success) {
        setPostStatus('suspended')
        toast.success('تم إيقاف المنشور بنجاح')
      } else {
        toast.error(result.error)
      }
    })
  }

  const StatusIcon = STATUS_CONFIG[status]?.icon || Clock

  return (
    <div className={cn(
      "group border rounded-2xl overflow-hidden transition-all duration-300 bg-white",
      expanded ? "ring-2 ring-emerald-500/10 border-emerald-200 shadow-xl shadow-emerald-500/5" : "border-slate-100 hover:border-slate-200 hover:shadow-md"
    )}>
      {/* Header Row */}
      <div 
        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status & Type Badge */}
        <div className="flex flex-row md:flex-col gap-2 shrink-0">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
            STATUS_CONFIG[status]?.color
          )}>
            <StatusIcon size={12} />
            {STATUS_CONFIG[status]?.label}
          </div>
          
          {report.post_id ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              <FileText size={12} />
              منشور
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
              <User size={12} />
              مستخدم
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 truncate">
              {report.post ? report.post.title : report.reported_user?.full_name}
            </h4>
            {postStatus === 'suspended' && (
              <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100 uppercase">موقوف</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1">
              <User size={12} className="text-slate-300" />
              <span>المُبلِغ: <span className="text-slate-600">{report.reporter?.full_name}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-300" />
              <span>{new Date(report.created_at).toLocaleDateString('ar-TN', { day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
          
          <p className={cn(
            "text-sm text-slate-600 leading-relaxed transition-all",
            expanded ? "mt-3" : "line-clamp-1 mt-1 opacity-70"
          )}>
            {report.reason}
          </p>
        </div>

        {/* Actions Preview / Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {report.post && (
            <Link
              href={`/marketplace/${report.post.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="عرض المنشور"
            >
              <ExternalLink size={18} />
            </Link>
          )}
          {report.reported_user && report.reported_user.username && (
            <Link
              href={`/profile/${report.reported_user.username}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="عرض الملف"
            >
              <ExternalLink size={18} />
            </Link>
          )}
          <div className={cn(
            "p-2 text-slate-300 group-hover:text-slate-500 transition-transform duration-300",
            expanded && "rotate-180"
          )}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Expanded Action Panel */}
      <div className={cn(
        "grid transition-all duration-500 ease-in-out",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-slate-50 space-y-5 bg-slate-50/30">
            {/* Reason Detail if long */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-4">
              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-500" />
                تفاصيل البلاغ
              </h5>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {report.reason}
              </p>
            </div>

            {/* Admin Note Input */}
            {status === 'pending' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-slate-400" />
                    ملاحظة المدير (اختياري)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 resize-none bg-white transition-all shadow-inner"
                    placeholder="اكتب ملاحظة لمراجعتها لاحقاً..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                  >
                    <CheckCircle2 size={18} />
                    تمت المراجعة
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('dismissed')}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-600 border border-slate-200 text-sm font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <XCircle size={18} />
                    رفض البلاغ
                  </button>

                  {report.post_id && postStatus !== 'suspended' && (
                    <button
                      onClick={handleSuspendPost}
                      disabled={isPending}
                      className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-100 transition-all active:scale-[0.98]"
                      title="إيقاف المنشور فوراً"
                    >
                      <Ban size={20} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-slate-400" />
                  ملاحظة المدير
                </h5>
                <p className="text-sm text-slate-600 italic">
                  {report.admin_note || 'لا توجد ملاحظات.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminReportsTable({ reports }: Props) {
  return (
    <div className="grid gap-4">
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} />
      ))}
    </div>
  )
}
