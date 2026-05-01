'use client'

import { useState, useTransition } from 'react'
import { suspendUserAction, restoreUserAction } from '@/actions/admin.actions'
import { ROLE_LABELS } from '@/lib/utils/constants'
import { Ban, RotateCcw, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  full_name: string
  username: string | null
  role: string
  phone: string | null
  city: string | null
  created_at: string
  deleted_at: string | null
  regions: { name_ar: string } | null
}

interface Props {
  users: User[]
}

const ROLE_COLORS: Record<string, string> = {
  farmer:  'bg-green-100 text-green-700',
  trader:  'bg-amber-100 text-amber-700',
  citizen: 'bg-blue-100 text-blue-700',
  admin:   'bg-red-100 text-red-700',
}

export default function AdminUsersTable({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  const runAction = (
    userId: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    suspended: boolean
  ) => {
    setActionId(userId)
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, deleted_at: suspended ? new Date().toISOString() : null }
              : u
          )
        )
      }
      setActionId(null)
    })
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-16 text-center text-stone-400">
        <p>لا يوجد مستخدمون في هذه الفئة</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-right">
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">المستخدم</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الدور</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الولاية</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الهاتف</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">تاريخ التسجيل</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">الحالة</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((user) => {
              const isLoading = isPending && actionId === user.id
              const isSuspended = !!user.deleted_at

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-stone-50 transition-colors ${isSuspended ? 'opacity-60' : ''}`}
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{user.full_name}</p>
                    {user.username && (
                      <p className="text-xs text-stone-400">@{user.username}</p>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${ROLE_COLORS[user.role] ?? 'bg-stone-100 text-stone-600'}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>

                  {/* Region */}
                  <td className="px-4 py-3 text-stone-600 text-xs">
                    {user.regions?.name_ar ?? '—'}
                    {user.city && ` · ${user.city}`}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-stone-500 text-xs" dir="ltr">
                    {user.phone ?? '—'}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('ar-TN')}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      isSuspended
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isSuspended ? 'موقوف' : 'نشط'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/profile/${user.username ?? user.id}`}
                        target="_blank"
                        className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                        title="عرض الملف الشخصي"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {!isSuspended && user.role !== 'admin' && (
                        <button
                          onClick={() =>
                            runAction(user.id, () => suspendUserAction(user.id), true)
                          }
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="إيقاف الحساب"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {isSuspended && (
                        <button
                          onClick={() =>
                            runAction(user.id, () => restoreUserAction(user.id), false)
                          }
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-green-50 text-stone-400 hover:text-green-600 transition-colors disabled:opacity-40"
                          title="استعادة الحساب"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
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
