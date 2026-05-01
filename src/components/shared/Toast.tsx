// src/components/shared/Toast.tsx
'use client'

/**
 * Lightweight toast system — no external dependencies.
 *
 * Usage:
 *   import { toast } from '@/components/shared/Toast'
 *   toast.success('تم الحفظ بنجاح')
 *   toast.error('فشل التنفيذ')
 *   toast.info('تم إرسال البلاغ')
 *
 * Add <Toaster /> once in your root layout (app/layout.tsx).
 *
 * Phase 2: swap internals with react-hot-toast or sonner without changing call sites.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// ─── Context ──────────────────────────────────────────────────────────────────

type AddToast = (item: Omit<ToastItem, 'id'>) => void

const ToastContext = createContext<AddToast | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  const add: AddToast = useCallback(({ type, message, duration = 4000 }) => {
    const id = crypto.randomUUID()
    setItems(prev => [...prev, { id, type, message, duration }])
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  // Expose imperative API on the singleton
  useEffect(() => {
    toastSingleton._add = add
  }, [add])

  const dismiss = (id: string) => setItems(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={add}>
      {/* Portal-like fixed container */}
      <div
        className="toast-container"
        role="region"
        aria-label="الإشعارات"
        aria-live="polite"
        dir="rtl"
      >
        {items.map(item => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Single toast card ────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />,
  error:   <AlertCircle  className="h-5 w-5 text-destructive shrink-0" />,
  info:    <Info         className="h-5 w-5 text-blue-500 shrink-0" />,
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Mount animation
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(12px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  return (
    <div
      ref={ref}
      role="alert"
      className={`toast-card toast-card--${item.type}`}
    >
      {ICONS[item.type]}
      <p className="toast-card__msg">{item.message}</p>
      <button
        className="toast-card__close"
        onClick={() => onDismiss(item.id)}
        aria-label="إغلاق"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Imperative singleton (works outside React tree) ─────────────────────────

const toastSingleton = {
  _add: null as AddToast | null,

  success(message: string, duration?: number) {
    this._add?.({ type: 'success', message, duration })
  },
  error(message: string, duration?: number) {
    this._add?.({ type: 'error', message, duration })
  },
  info(message: string, duration?: number) {
    this._add?.({ type: 'info', message, duration })
  },
}

/** Imperative toast API — usable in any component or server action callback. */
export const toast = toastSingleton

// ─── Hook (optional, for components that need to add toasts via context) ──────

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <Toaster />')
  return ctx
}
