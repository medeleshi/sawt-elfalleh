import { cn } from '@/lib/utils/cn'

interface OnboardingCardProps {
  children: React.ReactNode
  className?: string
}

/**
 * Card wrapper for onboarding step content.
 * Matches auth page card style for visual consistency.
 */
export default function OnboardingCard({
  children,
  className,
}: OnboardingCardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-white px-6 py-8 shadow-sm sm:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
