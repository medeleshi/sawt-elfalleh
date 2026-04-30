import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Wheat, ShoppingBag, Calendar } from 'lucide-react'
import {
  getProfileByUsername,
  getUserPosts,
  getUserPostStats,
} from '@/lib/queries/profile.queries'

interface PageProps {
  params: Promise<{ username: string }>
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
  const profile = await getProfileByUsername(username)
  if (!profile) return { title: 'المستخدم غير موجود' }
  return {
    title: `${profile.full_name} — صوت الفلاح`,
    description: profile.bio ?? `ملف ${profile.full_name} على صوت الفلاح`,
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const [posts, stats] = await Promise.all([
    getUserPosts(profile.id),
    getUserPostStats(profile.id),
  ])

  const activePosts = posts.filter((p) => p.status === 'active')

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

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-stone-900 mb-4">
          منشورات {profile.full_name}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Wheat className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>لا توجد منشورات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => {
              const firstImage = (
                post.post_images as Array<{ url: string; sort_order: number }>
              )?.sort((a, b) => a.sort_order - b.sort_order)[0]

              return (
                <Link
                  key={post.id}
                  href={`/marketplace/${post.id}`}
                  className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                    post.status !== 'active'
                      ? 'opacity-60 border-stone-200'
                      : 'border-stone-200'
                  }`}
                >
                  {firstImage ? (
                    <div className="relative h-36">
                      <Image
                        src={firstImage.url}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                      {post.status !== 'active' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-sm font-bold bg-black/60 px-3 py-1 rounded">
                            منتهي
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-36 bg-stone-50 flex items-center justify-center">
                      <span className="text-3xl">
                        {(post.categories as { icon: string } | null)?.icon ??
                          '📦'}
                      </span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          post.type === 'sell'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {post.type === 'sell' ? 'بيع' : 'شراء'}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {(post.regions as { name_ar: string } | null)?.name_ar}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {post.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-green-700 font-bold text-sm">
                        {post.price > 0
                          ? `${Number(post.price).toFixed(3)} د.ت`
                          : 'السعر قابل للتفاوض'}
                      </span>
                      <span className="text-xs text-stone-400">
                        {post.quantity}{' '}
                        {(post.units as { symbol: string } | null)?.symbol}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
