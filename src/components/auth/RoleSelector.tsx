'use client'

import { cn } from '@/lib/utils/cn'

type SelectableRole = 'farmer' | 'trader' | 'citizen'

interface RoleSelectorProps {
  value: SelectableRole | ''
  onChange: (role: SelectableRole) => void
  error?: string
}

const ROLES: {
  value: SelectableRole
  label: string
  description: string
  emoji: string
}[] = [
  {
    value: 'farmer',
    label: 'فلاح',
    description: 'أبيع وأشتري منتجاتي الفلاحية',
    emoji: '🧑‍🌾',
  },
  {
    value: 'trader',
    label: 'تاجر',
    description: 'أتاجر بالجملة وأبحث عن عروض',
    emoji: '🏪',
  },
  {
    value: 'citizen',
    label: 'مواطن',
    description: 'أشتري للاستهلاك الشخصي',
    emoji: '🧑',
  },
]

/**
 * Three-card role picker used in the register form.
 * Controlled component — parent owns the value via react-hook-form Controller.
 */
export default function RoleSelector({
  value,
  onChange,
  error,
}: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        نوع الحساب
        <span className="mr-1 text-destructive" aria-hidden>
          *
        </span>
      </p>

      <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="نوع الحساب">
        {ROLES.map((role) => {
          const selected = value === role.value
          return (
            <button
              key={role.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(role.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected
                  ? 'border-brand-500 bg-brand-50 shadow-sm'
                  : 'border-border bg-white hover:border-brand-200 hover:bg-brand-50/40',
                error && !selected && 'border-destructive/40'
              )}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {role.emoji}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold leading-tight',
                  selected ? 'text-brand-700' : 'text-foreground'
                )}
              >
                {role.label}
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {role.description}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
