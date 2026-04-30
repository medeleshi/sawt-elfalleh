import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AuthAlertProps {
  type: 'error' | 'success'
  message: string
  className?: string
}

/**
 * Inline alert for auth form feedback.
 * Used to show server action errors and success confirmations.
 */
export default function AuthAlert({ type, message, className }: AuthAlertProps) {
  const isError = type === 'error'

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        isError
          ? 'border-destructive/30 bg-destructive/8 text-destructive'
          : 'border-brand-200 bg-brand-50 text-brand-700',
        className
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <span>{message}</span>
    </div>
  )
}
