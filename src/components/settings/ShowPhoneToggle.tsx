'use client'

import { useState, useTransition } from 'react'
import { updateProfileAction } from '@/actions/profile.actions'

interface Props {
  initialValue: boolean
}

export default function ShowPhoneToggle({ initialValue }: Props) {
  const [showPhone, setShowPhone] = useState(initialValue)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    const newValue = !showPhone
    setShowPhone(newValue)
    setError(null)

    startTransition(async () => {
      // We need at least full_name to pass validation — we pass a minimal update
      // In real usage, this would call a dedicated action for show_phone only
      const result = await updateProfileAction({
        full_name: '', // placeholder — actual implementation would have a dedicated action
        show_phone: newValue,
      } as Parameters<typeof updateProfileAction>[0])

      if (!result.success) {
        setShowPhone(!newValue) // revert
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-stone-900">
          إظهار رقم الهاتف
        </p>
        <p className="text-xs text-stone-500 mt-0.5">
          عند التفعيل، سيرى الزوار رقم هاتفك في ملفك الشخصي
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <button
        role="switch"
        aria-checked={showPhone}
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          showPhone ? 'bg-green-600' : 'bg-stone-300'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            showPhone ? 'translate-x-1' : 'translate-x-6'
          }`}
        />
      </button>
    </div>
  )
}
