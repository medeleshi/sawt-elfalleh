'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wheat, Bookmark } from 'lucide-react'
import PostCard from '@/components/posts/PostCard'
import Pagination from '@/components/shared/Pagination'
import type { PaginationInfo, PostCard as PostCardType } from '@/types/marketplace'

interface Props {
  posts: PostCardType[]
  savedPosts?: any[]
  postsPagination: PaginationInfo
  savedPagination?: PaginationInfo
  isOwnProfile?: boolean
}

export default function MyProfileTabs({ 
  posts, 
  savedPosts = [], 
  postsPagination, 
  savedPagination,
  isOwnProfile = false 
}: Props) {
  const [tab, setTab] = useState<'posts' | 'saved'>(isOwnProfile ? 'posts' : 'posts')

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
          {isOwnProfile ? 'منشوراتي' : 'المنشورات'}
          <span className="bg-stone-100 text-stone-600 text-xs rounded-full px-2 py-0.5">
            {postsPagination.total}
          </span>
        </button>

        {isOwnProfile && (
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
              {savedPagination?.total ?? 0}
            </span>
          </button>
        )}
      </div>

      {/* Posts Tab */}
      {tab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Wheat className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="mb-4">لا توجد منشورات حالياً</p>
              {isOwnProfile && (
                <Link
                  href="/post/new"
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  أضف إعلانك الأول
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              
              {postsPagination.totalPages > 1 && (
                <Pagination pagination={postsPagination} />
              )}
            </div>
          )}
        </>
      )}

      {/* Saved Posts Tab (Own Profile Only) */}
      {isOwnProfile && tab === 'saved' && (
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPosts
                  .filter((sp) => sp.posts !== null)
                  .map((sp) => (
                    <PostCard key={sp.id} post={sp.posts!} />
                  ))}
              </div>

              {savedPagination && savedPagination.totalPages > 1 && (
                <Pagination pagination={savedPagination} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
