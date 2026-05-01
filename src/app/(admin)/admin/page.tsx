import { getAdminStats } from '@/lib/queries/admin.queries'
import { FileText, Users, Flag, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'لوحة التحكم',
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const cards = [
    {
      label: 'إجمالي المنشورات',
      value: stats.totalPosts,
      sub: `${stats.activePosts} نشط`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/posts',
    },
    {
      label: 'منشورات موقوفة',
      value: stats.suspendedPosts,
      sub: 'بحاجة مراجعة',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/posts?status=suspended',
    },
    {
      label: 'المستخدمون',
      value: stats.totalUsers,
      sub: 'مستخدم مسجّل',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/admin/users',
    },
    {
      label: 'بلاغات معلّقة',
      value: stats.pendingReports,
      sub: 'بانتظار المراجعة',
      icon: Flag,
      color: 'text-red-600',
      bg: 'bg-red-50',
      href: '/admin/reports',
    },
  ]

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">لوحة التحكم</h1>
        <p className="text-stone-500 text-sm mt-1">نظرة عامة على حالة المنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">
              {card.value.toLocaleString('ar-TN')}
            </div>
            <div className="text-sm font-semibold text-stone-700">{card.label}</div>
            <div className="text-xs text-stone-400 mt-0.5">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="text-sm font-bold text-stone-700 mb-4 uppercase tracking-wide">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/reports?status=pending"
            className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Flag className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">مراجعة البلاغات</p>
              <p className="text-xs text-red-500">
                {stats.pendingReports} بلاغ معلّق
              </p>
            </div>
          </Link>
          <Link
            href="/admin/posts?status=suspended"
            className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">منشورات موقوفة</p>
              <p className="text-xs text-amber-500">
                {stats.suspendedPosts} منشور
              </p>
            </div>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-stone-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-stone-800">إدارة الأصناف</p>
              <p className="text-xs text-stone-400">فئات، مقاييس، ولايات</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
