import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getMyProfile,
  getMyActivities,
  getMyFollowedRegions,
} from '@/lib/queries/profile.queries'
import EditProfileForm from '@/components/settings/EditProfileForm'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'تعديل الملف الشخصي — صوت الفلاح',
}

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all needed data in parallel
  const [profile, activityIds, followedRegionIds, regionsRes, categoriesRes] =
    await Promise.all([
      getMyProfile(user.id),
      getMyActivities(user.id),
      getMyFollowedRegions(user.id),
      supabase
        .from('regions')
        .select('id, name_ar')
        .order('sort_order', { ascending: true }),
      supabase
        .from('categories')
        .select('id, name_ar, icon, parent_id')
        .is('parent_id', null) // only top-level categories for activities
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ])

  if (!profile) redirect('/login')

  const regions = regionsRes.data ?? []
  const categories = categoriesRes.data ?? []

  return (
    <div className="min-h-screen bg-[#f9f6f0]" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/settings"
            className="text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              تعديل الملف الشخصي
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              قم بتحديث معلوماتك الشخصية
            </p>
          </div>
        </div>

        <EditProfileForm
          profile={{
            full_name: profile.full_name,
            bio: profile.bio ?? '',
            phone: profile.phone ?? '',
            city: profile.city ?? '',
            region_id: profile.region_id ?? '',
            avatar_url: profile.avatar_url ?? '',
          }}
          activityIds={activityIds}
          followedRegionIds={followedRegionIds}
          regions={regions}
          categories={categories}
        />
      </div>
    </div>
  )
}
