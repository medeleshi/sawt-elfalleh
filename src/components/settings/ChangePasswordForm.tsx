'use client'

import { useState, useTransition } from 'react'
import { changePasswordAction } from '@/actions/auth.actions'
import { Loader2, ShieldCheck, X } from 'lucide-react'

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await changePasswordAction({ success: false, error: '' }, formData)
      if (result.success) {
        setSuccess(true)
        // Close after a short delay to show success
        setTimeout(() => setIsOpen(false), 2000)
      } else {
        setError(result.error)
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-green-600 hover:underline font-semibold"
      >
        تغيير
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          تغيير كلمة المرور
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-stone-400 hover:text-stone-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            كلمة المرور الجديدة
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="8 أحرف على الأقل"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            تأكيد كلمة المرور
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="أعد كتابة كلمة المرور"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
            {error}
          </p>
        )}

        {success && (
          <p className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
            ✓ تم تغيير كلمة المرور بنجاح
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
        </button>
      </form>
    </div>
  )
}
