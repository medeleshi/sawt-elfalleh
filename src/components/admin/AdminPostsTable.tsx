'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  suspendPostAction,
  restorePostAction,
  deletePostAdminAction,
} from '@/actions/reports.actions'
import { POST_STATUS_LABELS, POST_TYPE_LABELS, ROLE_LABELS } from '@/lib/utils/constants'
import { ExternalLink, Ban, RotateCcw, Trash2 } from 'lucide-react'

interface Post {
  id: string
  title: string
  type: string
  status: string
  price: number
  created_at: string
  city: string | null
  profiles: { id: string; full_name: string; username: string | null; role: string } | null
  categories: { name_ar: string; icon: string | null } | null
  regions: { name_ar: string } | null
}

interface Props {
  posts: Post[]
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  expired:   'bg-stone-100 text-stone-500',
  deleted:   'bg-red-100 text-red-600',
  suspended: 'bg-amber-100 text-amber-700',
}

export default function AdminPostsTable({ posts: initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  const runAction = (
    postId: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    newStatus?: string
  ) => {
    setActionId(postId)
    startTransition(async () => {
      const result = await action()
      if (result.success && newStatus !== undefined) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, status: newStatus }
              : p
          )
        )
      } else if (result.success && newStatus === 'DELETED') {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      }
      setActionId(null)
    })
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-16 text-center text-stone-400">
        <p>لا توجد منشورات في هذه الفئة</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-right">
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">المنشور</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الناشر</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">النوع</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الحالة</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">السعر</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">التاريخ</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((post) => {
              const isLoading = isPending && actionId === post.id
              return (
                <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                  {/* Title */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0">
                        {post.categories?.icon ?? '📦'}
                      </span>
                      <div>
                        <p className="font-medium text-stone-900 truncate max-w-[160px]">
                          {post.title}
                        </p>
                        <p className="text-xs text-stone-400">
                          {post.categories?.name_ar} · {post.regions?.name_ar}
                          {post.city && ` · ${post.city}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">
                      {post.profiles?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {ROLE_LABELS[post.profiles?.role ?? ''] ?? post.profiles?.role}
                    </p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      post.type === 'sell'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {POST_TYPE_LABELS[post.type] ?? post.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[post.status] ?? 'bg-stone-100 text-stone-600'}`}>
                      {POST_STATUS_LABELS[post.status] ?? post.status}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-stone-700 font-medium">
                    {post.price > 0
                      ? `${Number(post.price).toFixed(3)}`
                      : '—'}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString('ar-TN')}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/marketplace/${post.id}`}
                        target="_blank"
                        className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                        title="عرض المنشور"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {post.status === 'active' && (
                        <button
                          onClick={() =>
                            runAction(
                              post.id,
                              () => suspendPostAction(post.id),
                              'suspended'
                            )
                          }
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-amber-50 text-stone-400 hover:text-amber-600 transition-colors disabled:opacity-40"
                          title="إيقاف المنشور"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {post.status === 'suspended' && (
                        <button
                          onClick={() =>
                            runAction(
                              post.id,
                              () => restorePostAction(post.id),
                              'active'
                            )
                          }
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-green-50 text-stone-400 hover:text-green-600 transition-colors disabled:opacity-40"
                          title="استعادة المنشور"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          runAction(
                            post.id,
                            () => deletePostAdminAction(post.id),
                            'DELETED'
                          )
                        }
                        disabled={isLoading}
                        className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
