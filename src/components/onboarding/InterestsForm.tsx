'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import Link from 'next/link'
import { saveInterestsAction } from '@/actions/onboarding.actions'
import { MAX_ACTIVITIES, MAX_FOLLOWED_REGIONS, ROUTES } from '@/lib/utils/constants'
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader'
import OnboardingCard from '@/components/onboarding/OnboardingCard'
import SelectableChip from '@/components/onboarding/SelectableChip'
import SubmitButton from '@/components/auth/SubmitButton'
import AuthAlert from '@/components/auth/AuthAlert'
import type { ActionResult, Category, Region } from '@/types/domain'

interface InterestsFormProps {
  categories: Pick<Category, 'id' | 'name_ar' | 'icon'>[]
  regions:    Pick<Region,   'id' | 'name_ar'>[]
}

const initialState: ActionResult = { success: false, error: '' }

export default function InterestsForm({ categories, regions }: InterestsFormProps) {
  const [state, formAction] = useFormState(saveInterestsAction, initialState)

  // Local selection state — drives UI + hidden inputs
  const [selectedActivities,  setSelectedActivities]  = useState<string[]>([])
  const [selectedRegions,     setSelectedRegions]     = useState<string[]>([])

  function toggleActivity(id: string) {
    setSelectedActivities((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_ACTIVITIES
          ? [...prev, id]
          : prev
    )
  }

  function toggleRegion(id: string) {
    setSelectedRegions((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_FOLLOWED_REGIONS
          ? [...prev, id]
          : prev
    )
  }

  const activitiesAtLimit  = selectedActivities.length  >= MAX_ACTIVITIES
  const regionsAtLimit     = selectedRegions.length     >= MAX_FOLLOWED_REGIONS

  return (
    <>
      <OnboardingStepHeader
        step={2}
        title="اختر اهتماماتك"
        description="نستخدمها لعرض منشورات تناسبك على الصفحة الرئيسية — يمكنك تغييرها لاحقاً"
      />

      <OnboardingCard>
        {!state.success && state.error && (
          <AuthAlert type="error" message={state.error} className="mb-5" />
        )}

        <form action={formAction} className="space-y-7" noValidate>
          {/* Hidden inputs — repeat per selected id so FormData.getAll() works */}
          {selectedActivities.map((id) => (
            <input key={id} type="hidden" name="activity_ids" value={id} />
          ))}
          {selectedRegions.map((id) => (
            <input key={id} type="hidden" name="followed_region_ids" value={id} />
          ))}

          {/* ── Activities ───────────────────────────────────────── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                أنشطتك الفلاحية
              </h2>
              <span className="text-xs text-muted-foreground">
                {selectedActivities.length}/{MAX_ACTIVITIES}
              </span>
            </div>

            {activitiesAtLimit && (
              <p className="mb-3 text-xs text-brand-600 font-medium">
                ✓ وصلت للحد الأقصى ({MAX_ACTIVITIES} أنشطة)
              </p>
            )}

            <div className="flex flex-wrap gap-2" role="group" aria-label="اختر أنشطتك الفلاحية">
              {categories.map((cat) => (
                <SelectableChip
                  key={cat.id}
                  label={cat.name_ar}
                  icon={cat.icon}
                  selected={selectedActivities.includes(cat.id)}
                  disabled={activitiesAtLimit}
                  onToggle={() => toggleActivity(cat.id)}
                />
              ))}
            </div>
          </section>

          {/* ── Followed regions ──────────────────────────────────── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                الولايات التي تتابعها
              </h2>
              <span className="text-xs text-muted-foreground">
                {selectedRegions.length}/{MAX_FOLLOWED_REGIONS}
              </span>
            </div>

            {regionsAtLimit && (
              <p className="mb-3 text-xs text-brand-600 font-medium">
                ✓ وصلت للحد الأقصى ({MAX_FOLLOWED_REGIONS} ولايات)
              </p>
            )}

            <div className="flex flex-wrap gap-2" role="group" aria-label="اختر الولايات التي تتابعها">
              {regions.map((reg) => (
                <SelectableChip
                  key={reg.id}
                  label={reg.name_ar}
                  selected={selectedRegions.includes(reg.id)}
                  disabled={regionsAtLimit}
                  onToggle={() => toggleRegion(reg.id)}
                />
              ))}
            </div>
          </section>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="space-y-3 pt-1">
            <SubmitButton label="التالي ←" loadingLabel="جاري الحفظ..." />

            {/* Skip link — interests are optional per PRD spec 6.3 */}
            <Link
              href={ROUTES.ONBOARDING_DONE}
              className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              تخطي هذه الخطوة
            </Link>
          </div>
        </form>
      </OnboardingCard>
    </>
  )
}
