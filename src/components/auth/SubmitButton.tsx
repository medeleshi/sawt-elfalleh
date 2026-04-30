'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils/cn'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  className?: string
}

/**
 * Submit button that reads react-dom's useFormStatus.
 * Automatically disables and shows loading state during form submission.
 * Must be a child of a <form> element.
 */
export default function SubmitButton({
  label,
  loadingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        'flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white',
        'transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-60',
        className
      )}
    >
      {pending ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden
          />
          {loadingLabel ?? label}
        </>
      ) : (
        label
      )}
    </button>
  )
}
