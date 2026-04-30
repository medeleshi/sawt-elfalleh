'use client'

import { useFormState } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveProfileAction } from '@/actions/onboarding.actions'
import {
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from '@/lib/validators/onboarding.schema'
import { ROLE_LABELS } from '@/lib/utils/constants'
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader'
import OnboardingCard from '@/components/onboarding/OnboardingCard'
import FormField from '@/components/auth/FormField'
import SubmitButton from '@/components/auth/SubmitButton'
import AuthAlert from '@/components/auth/AuthAlert'
import type { ActionResult, Region, UserRole } from '@/types/domain'

interface ProfileFormProps {
  regions: Pick<Region, 'id' | 'name_ar'>[]
  /** Pre-filled from existing profile row */
  defaultValues: {
    full_name: string
    role: UserRole
    region_id: string | null
    city: string | null
    phone: string | null
    bio: string | null
  }
}

const initialState: ActionResult = { success: false, error: '' }

const SELECTABLE_ROLES: { value: 'farmer' | 'trader' | 'citizen'; emoji: string }[] = [
  { value: 'farmer',  emoji: '🧑‍🌾' },
  { value: 'trader',  emoji: '🏪' },
  { value: 'citizen', emoji: '🧑' },
]

export default function ProfileForm({ regions, defaultValues }: ProfileFormProps) {
  const [state, formAction] = useFormState(saveProfileAction, initialState)

  const {
    register,
    control,
    formState: { errors },
  } = useForm<OnboardingProfileInput>({
    resolver: zodResolver(onboardingProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      full_name: defaultValues.full_name ?? '',
      role:      (defaultValues.role as 'farmer' | 'trader' | 'citizen') ?? 'farmer',
      region_id: defaultValues.region_id ?? '',
      city:      defaultValues.city ?? '',
      phone:     defaultValues.phone ?? '',
      bio:       defaultValues.bio ?? '',
    },
  })

  return (
    <>
      <OnboardingStepHeader
        step={1}
        title="أخبرنا عن نفسك"
        description="هذه المعلومات ستساعد الفلاحين والتجار على التعرف عليك بسهولة"
      />

      <OnboardingCard>
        {!state.success && state.error && (
          <AuthAlert type="error" message={state.error} className="mb-5" />
        )}

        <form action={formAction} className="space-y-5" noValidate>
          {/* Full name */}
          <FormField
            {...register('full_name')}
            label="الاسم الكامل"
            type="text"
            placeholder="مثال: محمد بن علي"
            autoComplete="name"
            required
            error={errors.full_name?.message}
          />

          {/* Role — re-selectable per spec section 8.1 */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  نوع الحساب
                  <span className="mr-1 text-destructive" aria-hidden>*</span>
                </p>
                {/* Hidden input for FormData */}
                <input type="hidden" name="role" value={field.value} />
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="نوع الحساب">
                  {SELECTABLE_ROLES.map(({ value, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === value}
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        field.value === value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-border bg-white hover:border-brand-200'
                      }`}
                    >
                      <span className="text-2xl" aria-hidden>{emoji}</span>
                      <span className={`text-sm font-semibold ${field.value === value ? 'text-brand-700' : 'text-foreground'}`}>
                        {ROLE_LABELS[value]}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p role="alert" className="text-xs text-destructive">{errors.role.message}</p>
                )}
              </div>
            )}
          />

          {/* Region select */}
          <Controller
            name="region_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label htmlFor="region_id" className="block text-sm font-medium text-foreground">
                  الولاية
                  <span className="mr-1 text-destructive" aria-hidden>*</span>
                </label>
                {/* Hidden input for FormData */}
                <input type="hidden" name="region_id" value={field.value ?? ''} />
                <select
                  id="region_id"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  aria-invalid={!!errors.region_id}
                  aria-describedby={errors.region_id ? 'region_id-error' : undefined}
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                    errors.region_id ? 'border-destructive' : 'border-input'
                  }`}
                >
                  <option value="" disabled>اختر ولايتك...</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name_ar}</option>
                  ))}
                </select>
                {errors.region_id && (
                  <p id="region_id-error" role="alert" className="text-xs text-destructive">
                    {errors.region_id.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* City */}
          <FormField
            {...register('city')}
            label="المعتمدية / المدينة"
            type="text"
            placeholder="مثال: سيدي بوزيد الغربية"
            error={errors.city?.message}
          />

          {/* Phone */}
          <FormField
            {...register('phone')}
            label="رقم الهاتف"
            type="tel"
            placeholder="مثال: 20123456"
            autoComplete="tel"
            inputMode="tel"
            hint="سيُستخدم للتواصل المباشر مع المشترين والبائعين"
            error={errors.phone?.message}
          />

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-medium text-foreground">
              نبذة عنك
              <span className="mr-2 text-xs font-normal text-muted-foreground">(اختياري)</span>
            </label>
            <textarea
              {...register('bio')}
              id="bio"
              rows={3}
              placeholder="مثال: فلاح من سيدي بوزيد، متخصص في الزيتون والحبوب منذ 20 سنة"
              className={`flex w-full resize-none rounded-lg border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                errors.bio ? 'border-destructive' : 'border-input'
              }`}
            />
            {errors.bio && (
              <p role="alert" className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <SubmitButton label="التالي ←" loadingLabel="جاري الحفظ..." />
        </form>
      </OnboardingCard>
    </>
  )
}
