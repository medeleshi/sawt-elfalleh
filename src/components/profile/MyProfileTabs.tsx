'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Wheat, Bookmark } from 'lucide-react'

interface Post {
  id: string
  type: string
  title: string
  price: number
  is_negotiable: boolean
  quantity: number
  status: string
  created_at: string
  city: string | null
  regions: { name_ar: string } | null
  categories: { name_ar: string; icon: string } | null
  units: { symbol: string } | null
  post_images: Array<{ url: string; sort_order: number }>
}

interface SavedPost {
  id: string
  created_at: string
  posts: Post | null
}

interface Props {
  posts: Post[]
  savedPosts: SavedPost[]
}

function PostCard({ post }: { post: Post }) {
  const firstImage = post.post_images
    ?.sort((a, b) => a.sort_order - b.sort_order)[0]

  return (
    <Link
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
          <span className="text-3xl">{post.categories?.icon ?? '📦'}</span>
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
            {post.regions?.name_ar}
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
            {post.quantity} {post.units?.symbol}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MyProfileTabs({ posts, savedPosts }: Props) {
  const [tab, setTab] = useState<'posts' | 'saved'>('posts')

  const activePosts = posts.filter((p) => p.status === 'active')

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex border-b border-stone-200 mb-6">
        <button
          onClick={() => setTab('posts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'posts'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Wheat className="w-4 h-4" />
          منشوراتي
          <span className="bg-stone-100 text-stone-600 text-xs rounded-full px-2 py-0.5">
            {posts.length}
          </span>
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'saved'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          المحفوظات
          <span className="bg-stone-100 text-stone-600 text-xs rounded-full px-2 py-0.5">
            {savedPosts.length}
          </span>
        </button>
      </div>

      {/* My Posts Tab */}
      {tab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Wheat className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="mb-4">لم تنشر أي إعلان بعد</p>
              <Link
                href="/post/new"
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                أضف إعلانك الأول
              </Link>
            </div>
          ) : (
            <>
              {activePosts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-stone-500 mb-3">
                    المنشورات النشطة ({activePosts.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activePosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {posts.filter((p) => p.status !== 'active').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-stone-500 mb-3">
                    المنشورات المنتهية (
                    {posts.filter((p) => p.status !== 'active').length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {posts
                      .filter((p) => p.status !== 'active')
                      .map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Saved Posts Tab */}
      {tab === 'saved' && (
        <>
          {savedPosts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="mb-4">لم تحفظ أي إعلان بعد</p>
              <Link
                href="/marketplace"
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                تصفح السوق
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedPosts
                .filter((sp) => sp.posts !== null)
                .map((sp) => (
                  <PostCard key={sp.id} post={sp.posts!} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
