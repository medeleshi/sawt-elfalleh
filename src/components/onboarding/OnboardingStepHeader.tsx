import { cn } from '@/lib/utils/cn'

interface OnboardingStepHeaderProps {
  step: 1 | 2 | 3
  title: string
  description: string
}

const STEPS = [
  { label: 'ملفك الشخصي' },
  { label: 'اهتماماتك' },
  { label: 'انطلق' },
]

/**
 * Step progress indicator + title used at the top of each onboarding page.
 */
export default function OnboardingStepHeader({
  step,
  title,
  description,
}: OnboardingStepHeaderProps) {
  return (
    <div className="mb-8">
      {/* Step dots */}
      <div className="mb-6 flex items-center justify-center gap-2" aria-label={`الخطوة ${step} من 3`}>
        {STEPS.map((s, i) => {
          const num = i + 1
          const isCompleted = num < step
          const isCurrent = num === step

          return (
            <div key={num} className="flex items-center gap-2">
              {/* Dot */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isCompleted && 'bg-brand-600 text-white',
                  isCurrent && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 14 14" aria-hidden>
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  num
                )}
              </div>

              {/* Connector line between dots */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-10 rounded-full transition-colors',
                    num < step ? 'bg-brand-400' : 'bg-muted'
                  )}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step label */}
      <p className="mb-1 text-center text-xs font-medium uppercase tracking-widest text-brand-500">
        الخطوة {step} من 3 — {STEPS[step - 1].label}
      </p>

      {/* Title */}
      <h1 className="text-center text-2xl font-bold text-foreground">
        {title}
      </h1>

      {/* Description */}
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
