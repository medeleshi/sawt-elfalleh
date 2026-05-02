'use client'

import { useState, useTransition } from 'react'
import { togglePhoneVisibilityAction } from '@/actions/profile.actions'
import { Loader2 } from 'lucide-react'

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
      const result = await togglePhoneVisibilityAction(newValue)

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
          className={`relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            showPhone ? (document.dir === 'rtl' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-1'
          }`}
        >
          {isPending && (
            <Loader2 className="w-2 h-2 text-stone-400 animate-spin absolute inset-0 m-auto" />
          )}
        </span>
      </button>
    </div>
  )
}
