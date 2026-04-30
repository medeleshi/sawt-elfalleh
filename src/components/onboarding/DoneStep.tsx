'use client'

import { useState } from 'react'
import { completeOnboardingAction } from '@/actions/onboarding.actions'
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader'
import OnboardingCard from '@/components/onboarding/OnboardingCard'
import AuthAlert from '@/components/auth/AuthAlert'

interface DoneStepProps {
  fullName: string
}

/**
 * Step 3 — completion screen.
 * Calls completeOnboardingAction() which sets is_profile_completed = true
 * and redirects to home. Middleware will no longer intercept after this.
 *
 * Uses plain useState instead of startTransition(async) for React 18
 * compatibility — startTransition does not support async callbacks in React 18.
 */
export default function DoneStep({ fullName }: DoneStepProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete() {
    if (isPending) return
    setIsPending(true)
    setError(null)

    try {
      // On success, completeOnboardingAction calls redirect() internally —
      // execution never returns here on the happy path.
      const result = await completeOnboardingAction()
      if (result && !result.success) {
        setError(result.error)
        setIsPending(false)
      }
    } catch {
      // redirect() throws a NEXT_REDIRECT error internally — this is expected
      // on success and must not be caught as a real error.
      // Any other error: show fallback message.
      setError('حدث خطأ غير متوقع. يرجى المحاولة مجدداً.')
      setIsPending(false)
    }
  }

  return (
    <>
      <OnboardingStepHeader
        step={3}
        title={`مرحباً بك، ${fullName || 'في صوت الفلاح'}! 🎉`}
        description="حسابك جاهز. يمكنك الآن نشر إعلاناتك والتواصل مع الفلاحين والتجار"
      />

      <OnboardingCard>
        <ul className="mb-8 space-y-4">
          {[
            { emoji: '📢', text: 'انشر إعلانات بيع وشراء في دقائق' },
            { emoji: '🔍', text: 'ابحث عن منتجات بالولاية والصنف والسعر' },
            { emoji: '📞', text: 'تواصل مباشرة بالهاتف أو واتساب' },
            { emoji: '📍', text: 'اكتشف عروض من ولايتك وولايات تتابعها' },
          ].map(({ emoji, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xl"
                aria-hidden
              >
                {emoji}
              </span>
              <span className="text-sm text-foreground leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {error && (
          <AuthAlert type="error" message={error} className="mb-4" />
        )}

        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden
              />
              جاري الانطلاق...
            </>
          ) : (
            'انطلق إلى السوق 🌾'
          )}
        </button>
      </OnboardingCard>
    </>
  )
}
