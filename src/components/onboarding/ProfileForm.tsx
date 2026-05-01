'use client'

import { useFormState } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, User, X } from 'lucide-react'
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
    avatar_url?: string | null
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
  const [preview, setPreview] = useState<string | null>(defaultValues.avatar_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    setValue,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setValue('avatar', file)
    }
  }

  const removeImage = () => {
    setPreview(null)
    setValue('avatar', undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

        <form action={formAction} className="space-y-6" noValidate>
          {/* Avatar Picker */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden transition-colors hover:border-brand-300">
                {preview ? (
                  <Image
                    src={preview}
                    alt="معاينة الصورة"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-stone-300" />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors"
                title="تغيير الصورة"
              >
                <Camera className="w-4 h-4" />
              </button>

              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                  title="إزالة الصورة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-stone-700">صورة الملف الشخصي</p>
              <p className="text-xs text-stone-400 mt-1">JPEG أو PNG، بحد أقصى 2 ميجا</p>
            </div>

            <input
              type="file"
              name="avatar"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            {/* Hidden field for existing URL if no new file is picked */}
            <input type="hidden" name="avatar_url" value={defaultValues.avatar_url ?? ''} />
          </div>

          <div className="space-y-5">
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

            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    نوع الحساب
                    <span className="mr-1 text-destructive" aria-hidden>*</span>
                  </p>
                  <input type="hidden" name="role" value={field.value} />
                  <div className="grid grid-cols-3 gap-2" role="radiogroup">
                    {SELECTABLE_ROLES.map(({ value, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === value}
                        onClick={() => field.onChange(value)}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                          field.value === value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-border bg-white hover:border-brand-200'
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className={`text-sm font-semibold ${field.value === value ? 'text-brand-700' : 'text-foreground'}`}>
                          {ROLE_LABELS[value]}
                        </span>
                      </button>
                    ))}
                  </div>
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
                  <input type="hidden" name="region_id" value={field.value ?? ''} />
                  <select
                    id="region_id"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-shadow focus:ring-2 focus:ring-brand-500/20 ${
                      errors.region_id ? 'border-destructive' : 'border-input'
                    }`}
                  >
                    <option value="" disabled>اختر ولايتك...</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name_ar}</option>
                    ))}
                  </select>
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
                placeholder="مثال: فلاح من سيدي بوزيد، متخصص في الزيتون والحبوب"
                className={`flex w-full resize-none rounded-lg border px-3 py-2 text-sm text-foreground transition-shadow focus:ring-2 focus:ring-brand-500/20 ${
                  errors.bio ? 'border-destructive' : 'border-input'
                }`}
              />
            </div>

            <SubmitButton label="التالي ←" loadingLabel="جاري الحفظ..." />
          </div>
        </form>
      </OnboardingCard>
    </>
  )
}
