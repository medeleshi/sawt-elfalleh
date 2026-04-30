import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getMyProfile,
  getUserPosts,
  getMySavedPosts,
  getUserPostStats,
} from '@/lib/queries/profile.queries'
import MyProfileTabs from '@/components/profile/MyProfileTabs'
import { Settings, Edit } from 'lucide-react'

export const metadata = {
  title: 'ملفي الشخصي — صوت الفلاح',
}

const ROLE_LABEL: Record<string, string> = {
  farmer: 'فلاح',
  trader: 'تاجر',
  citizen: 'مواطن',
  admin: 'مدير',
}

export default async function MyProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profile, posts, savedPosts, stats] = await Promise.all([
    getMyProfile(user.id),
    getUserPosts(user.id),
    getMySavedPosts(user.id),
    getUserPostStats(user.id),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f9f6f0]" dir="rtl">
      {/* Header */}
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
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              </div>

              {profile.bio && (
                <p className="text-stone-600 text-sm mb-3 max-w-lg">
                  {profile.bio}
                </p>
              )}

              {profile.username && (
                <p className="text-stone-400 text-sm mb-2">
                  @{profile.username}
                </p>
              )}

              {(profile.regions as { name_ar: string } | null)?.name_ar && (
                <p className="text-stone-500 text-sm">
                  📍{' '}
                  {(profile.regions as { name_ar: string }).name_ar}
                  {profile.city && `، ${profile.city}`}
                </p>
              )}
            </div>

            {/* Stats + Actions */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex gap-3">
                <div className="bg-stone-50 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {stats.total}
                  </div>
                  <div className="text-xs text-stone-500">المنشورات</div>
                </div>
                <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {stats.active}
                  </div>
                  <div className="text-xs text-green-600">نشط</div>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <Link
                  href="/settings/profile"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm rounded-lg px-3 py-2 hover:bg-green-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  تعديل الملف
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-center bg-stone-100 text-stone-700 rounded-lg px-3 py-2 hover:bg-stone-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: My Posts + Saved Posts */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MyProfileTabs posts={posts} savedPosts={savedPosts} />
      </div>
    </div>
  )
}
