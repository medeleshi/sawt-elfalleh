import { getAdminUsers } from '@/lib/queries/admin.queries'
import AdminUsersTable from '@/components/admin/AdminUsersTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة المستخدمين' }

const ROLE_TABS = [
  { value: 'all',     label: 'الكل' },
  { value: 'farmer',  label: 'فلاحون' },
  { value: 'trader',  label: 'تجار' },
  { value: 'citizen', label: 'مواطنون' },
  { value: 'admin',   label: 'مدراء' },
]

interface PageProps {
  searchParams: Promise<{ role?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role = 'all', page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const limit = 20

  const { users, total } = await getAdminUsers({ role, page: currentPage, limit })
  const totalPages = Math.ceil(total / limit)

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">إدارة المستخدمين</h1>
        <p className="text-stone-500 text-sm mt-1">
          إجمالي {total.toLocaleString('ar-TN')} مستخدم
        </p>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        {ROLE_TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/users?role=${tab.value}`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              role === tab.value
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <AdminUsersTable users={users} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <a
              href={`/admin/users?role=${role}&page=${currentPage - 1}`}
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
              href={`/admin/users?role=${role}&page=${currentPage + 1}`}
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
