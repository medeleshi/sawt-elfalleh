'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { AtSign, Check, X, Loader2 } from 'lucide-react'
import {
  updateUsernameAction,
  checkUsernameAvailabilityAction,
} from '@/actions/username.actions'

interface Props {
  currentUsername: string | null
}

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function UsernameSettingsForm({ currentUsername }: Props) {
  const [value, setValue] = useState(currentUsername ?? '')
  const [status, setStatus] = useState<Status>('idle')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Live availability check ───────────────────────────────────────────────
  useEffect(() => {
    const trimmed = value.trim()

    if (trimmed === currentUsername) {
      setStatus('idle')
      setSuggestion(null)
      return
    }

    if (trimmed.length < 3) {
      setStatus('idle')
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    setStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailabilityAction(trimmed)
      if (!result.success) {
        setStatus('invalid')
        setMessage(result.error)
        return
      }
      if (result.data?.available) {
        setStatus('available')
        setSuggestion(null)
      } else {
        setStatus('taken')
        setSuggestion(result.data?.suggestion ?? null)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, currentUsername])

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    startTransition(async () => {
      setSaved(false)
      setMessage(null)
      const result = await updateUsernameAction(value.trim())
      if (result.success) {
        setSaved(true)
        setStatus('idle')
        setTimeout(() => setSaved(false), 3000)
      } else {
        setMessage(result.error)
      }
    })
  }

  const canSave =
    value.trim().length >= 3 &&
    value.trim() !== currentUsername &&
    (status === 'available' || status === 'idle') &&
    !isPending

  return (
    <div className="username-settings-form">
      <label htmlFor="username-input" className="username-label">
        <AtSign className="w-4 h-4" />
        اسم المستخدم
      </label>

      <div className="username-input-wrapper">
        <div className="username-prefix">sawt.app/profile/</div>
        <input
          id="username-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase())}
          placeholder="username"
          maxLength={30}
          dir="ltr"
          className="username-input"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="username-status-icon">
          {status === 'checking' && (
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
          )}
          {status === 'available' && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {(status === 'taken' || status === 'invalid') && (
            <X className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Status messages */}
      <div className="username-feedback">
        {status === 'available' && (
          <p className="username-feedback-ok">✓ هذا الاسم متاح</p>
        )}
        {status === 'taken' && (
          <p className="username-feedback-error">
            هذا الاسم مأخوذ.
            {suggestion && (
              <button
                type="button"
                className="username-suggestion-btn"
                onClick={() => setValue(suggestion)}
              >
                {' '}استخدم: @{suggestion}
              </button>
            )}
          </p>
        )}
        {status === 'invalid' && message && (
          <p className="username-feedback-error">{message}</p>
        )}
        {saved && (
          <p className="username-feedback-ok">✓ تم حفظ اسم المستخدم بنجاح</p>
        )}
        {!saved && message && status === 'idle' && (
          <p className="username-feedback-error">{message}</p>
        )}
        {status === 'idle' && !saved && !message && (
          <p className="username-hint">
            يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط (3–30 حرفاً)
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="username-save-btn"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'حفظ اسم المستخدم'
        )}
      </button>
    </div>
  )
}
