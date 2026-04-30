'use client'

import { useState, useTransition } from 'react'
import { updateNotificationSettingsAction } from '@/actions/profile.actions'

interface NotifSettings {
  new_post_region: boolean
  new_post_activity: boolean
  messages: boolean
  platform_updates: boolean
}

interface Props {
  settings: NotifSettings
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1 ml-4">
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          checked ? 'bg-green-600' : 'bg-stone-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-1' : 'translate-x-6'
          }`}
        />
      </button>
    </div>
  )
}

export default function NotificationSettingsForm({ settings }: Props) {
  const [values, setValues] = useState<NotifSettings>({
    new_post_region: settings.new_post_region,
    new_post_activity: settings.new_post_activity,
    messages: settings.messages,
    platform_updates: settings.platform_updates,
  })
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (key: keyof NotifSettings, value: boolean) => {
    const updated = { ...values, [key]: value }
    setValues(updated)
    setStatus('idle')

    startTransition(async () => {
      const result = await updateNotificationSettingsAction(updated)
      if (result.success) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setValues(values) // revert
        setStatus('error')
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <div>
      <ToggleRow
        label="منشورات من ولايتك"
        description="إشعار عند نشر إعلان جديد في ولايتك"
        checked={values.new_post_region}
        onChange={(v) => handleChange('new_post_region', v)}
        disabled={isPending}
      />
      <ToggleRow
        label="منشورات تتعلق بنشاطك"
        description="إشعار عند نشر إعلان في صنف من اهتماماتك"
        checked={values.new_post_activity}
        onChange={(v) => handleChange('new_post_activity', v)}
        disabled={isPending}
      />
      <ToggleRow
        label="الرسائل"
        description="إشعار عند استلام رسالة جديدة"
        checked={values.messages}
        onChange={(v) => handleChange('messages', v)}
        disabled={isPending}
      />
      <ToggleRow
        label="تحديثات المنصة"
        description="أخبار وتحديثات من فريق صوت الفلاح"
        checked={values.platform_updates}
        onChange={(v) => handleChange('platform_updates', v)}
        disabled={isPending}
      />

      {/* Status */}
      {status === 'success' && (
        <p className="text-xs text-green-600 mt-3">✓ تم حفظ الإعدادات</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-3">{errorMsg}</p>
      )}
    </div>
  )
}
