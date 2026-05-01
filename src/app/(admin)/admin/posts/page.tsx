import { getAdminPosts } from '@/lib/queries/admin.queries'
import AdminPostsTable from '@/components/admin/AdminPostsTable'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'إدارة المنشورات' }

const STATUS_TABS = [
  { value: 'all',       label: 'الكل' },
  { value: 'active',    label: 'نشط' },
  { value: 'suspended', label: 'موقوف' },
  { value: 'expired',   label: 'منتهي' },
  { value: 'deleted',   label: 'محذوف' },
]

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const { status = 'all', page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const limit = 20

  const { posts, total } = await getAdminPosts({
    status,
    page: currentPage,
    limit,
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">إدارة المنشورات</h1>
        <p className="text-stone-500 text-sm mt-1">
          إجمالي {total.toLocaleString('ar-TN')} منشور
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/posts?status=${tab.value}`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <AdminPostsTable posts={posts} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <a
              href={`/admin/posts?status=${status}&page=${currentPage - 1}`}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50"
            >
              السابق
            </a>
          )}
          <span className="text-sm text-stone-500">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={`/admin/posts?status=${status}&page=${currentPage + 1}`}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm hover:bg-stone-50"
            >
              التالي
            </a>
          )}
        </div>
      )}
    </div>
  )
}
