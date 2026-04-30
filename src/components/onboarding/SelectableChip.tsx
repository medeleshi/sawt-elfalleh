'use client'

import { cn } from '@/lib/utils/cn'

interface SelectableChipProps {
  label: string
  icon?: string | null
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}

/**
 * Togglable chip for multi-select lists (activities, followed regions).
 * Rendered as a button with role="checkbox" for accessibility.
 * `disabled` is set when the max selection limit is reached and this chip is NOT selected.
 */
export default function SelectableChip({
  label,
  icon,
  selected,
  disabled = false,
  onToggle,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
          : 'border-border bg-white text-foreground hover:border-brand-300 hover:bg-brand-50/40',
        disabled && !selected && 'cursor-not-allowed opacity-40'
      )}
    >
      {icon && (
        <span className="text-base leading-none" aria-hidden>
          {icon}
        </span>
      )}
      {label}
      {selected && (
        <svg
          className="h-3.5 w-3.5 text-brand-600"
          fill="none"
          viewBox="0 0 14 14"
          aria-hidden
        >
          <path
            d="M2.5 7l3 3 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
