import { getAdminCategories } from '@/lib/queries/admin.queries'
import AdminCatalogTabs from '@/components/admin/AdminCatalogTabs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الأصناف' }

export default async function AdminCategoriesPage() {
  const { categories, units, regions } = await getAdminCategories()

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">إدارة الأصناف</h1>
        <p className="text-stone-500 text-sm mt-1">
          الفئات، المقاييس، والولايات
        </p>
      </div>

      <AdminCatalogTabs
        categories={categories}
        units={units}
        regions={regions}
      />
    </div>
  )
}
