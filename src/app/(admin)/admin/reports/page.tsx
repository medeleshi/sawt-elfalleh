import { getAdminReports } from '@/lib/queries/admin.queries'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'
import AdminReportsTable from '@/components/admin/AdminReportsTable'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export const metadata = {
  title: 'إدارة البلاغات — لوحة التحكم',
}

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { page?: string; status?: string }
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1', 10)
  const status = searchParams.status || 'pending'
  const { reports, total } = await getAdminReports({ status, page })

  const totalPages = Math.ceil(total / 20)

  const filters = [
    { id: 'pending', label: 'معلقة' },
    { id: 'reviewed', label: 'تمت المراجعة' },
    { id: 'dismissed', label: 'مرفوضة' },
    { id: 'all', label: 'الكل' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة البلاغات</h1>
          <p className="text-slate-500 font-medium mt-1">مراجعة والتعامل مع تبليغات المستخدمين للحفاظ على أمان المجتمع.</p>
        </div>

        <nav className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
          {filters.map((f) => (
            <Link
              key={f.id}
              href={`/admin/reports?status=${f.id}`}
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all",
                status === f.id 
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {reports.length > 0 ? (
          <>
            <AdminReportsTable reports={reports as any} />

            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination
                  pagination={{
                    page,
                    totalPages,
                    total,
                    limit: 20
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 py-20 shadow-sm">
            <EmptyState
              title="لا توجد بلاغات"
              description={status === 'pending' ? 'أحسنت! لا توجد بلاغات معلقة لمراجعتها.' : 'لم نجد أي بلاغات مطابقة لهذا الفلتر.'}
            />
          </div>
        )}
      </div>

      {/* Stats Quick View (Optional) */}
      {status === 'pending' && reports.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="font-black text-lg">!</span>
          </div>
          <p className="text-sm text-amber-800 font-bold">
            هناك {total} بلاغ{total > 10 ? 'اً' : ''} بانتظار المراجعة. يرجى التعامل معها لضمان جودة المحتوى.
          </p>
        </div>
      )}
    </div>
  )
}
