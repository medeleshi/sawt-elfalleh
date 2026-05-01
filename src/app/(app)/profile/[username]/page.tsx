import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Phone, Calendar } from 'lucide-react'
import {
  getProfileByUsername,
  getUserPosts,
  getUserPostStats,
} from '@/lib/queries/profile.queries'
import MyProfileTabs from '@/components/profile/MyProfileTabs'
import ReportModal from '@/components/reports/ReportModal'

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

const ROLE_LABEL: Record<string, string> = {
  farmer: 'فلاح',
  trader: 'تاجر',
  citizen: 'مواطن',
  admin: 'مدير',
}

const ROLE_COLOR: Record<string, string> = {
  farmer: 'bg-green-100 text-green-800',
  trader: 'bg-amber-100 text-amber-800',
  citizen: 'bg-blue-100 text-blue-800',
  admin: 'bg-red-100 text-red-800',
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const profile = (await getProfileByUsername(username)) as any
  if (!profile) return { title: 'المستخدم غير موجود' }
  return {
    title: `${profile.full_name} — صوت الفلاح`,
    description: profile.bio ?? `ملف ${profile.full_name} على صوت الفلاح`,
  }
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { page: pageStr } = await searchParams
  const page = parseInt(pageStr || '1', 10)

  const profile = (await getProfileByUsername(username)) as any
  if (!profile) notFound()

  const [{ posts, pagination: postsPagination }, stats] = (await Promise.all([
    getUserPosts(profile.id, page),
    getUserPostStats(profile.id),
  ])) as [any, any]

  return (
    <div className="min-h-screen bg-[#f9f6f0]" dir="rtl">
      {/* Profile Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-green-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-4 ring-green-100">
                  <span className="text-white text-3xl font-bold">
                    {profile.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-right">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-stone-900">
                  {profile.full_name}
                </h1>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLOR[profile.role] ?? 'bg-stone-100 text-stone-700'}`}
                >
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              </div>

              {profile.bio && (
                <p className="text-stone-600 text-sm mb-3 max-w-lg">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-stone-500">
                {(profile.regions as { name_ar: string } | null)?.name_ar && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {(profile.regions as { name_ar: string }).name_ar}
                    {profile.city && `، ${profile.city}`}
                  </span>
                )}
                {profile.show_phone && profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  عضو منذ {new Date(profile.created_at).getFullYear()}
                </span>
              </div>

              {/* Report User Action */}
              <div className="mt-4">
                <ReportModal 
                  reportedUserId={profile.id}
                  trigger={
                    <button className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1">
                      إبلاغ عن هذا المستخدم
                    </button>
                  }
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-4 sm:gap-2 text-center shrink-0">
              <div className="bg-stone-50 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-stone-900">
                  {stats.total}
                </div>
                <div className="text-xs text-stone-500">إجمالي المنشورات</div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-green-700">
                  {stats.active}
                </div>
                <div className="text-xs text-green-600">منشور نشط</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts & Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MyProfileTabs 
          posts={posts} 
          postsPagination={postsPagination}
          isOwnProfile={false}
        />
      </div>
    </div>
  )
}
