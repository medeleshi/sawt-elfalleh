import { z } from 'zod'

// ─── Step 1: Profile ──────────────────────────────────────────────────────────

/**
 * Matches profiles table constraints exactly:
 * - full_name: not null, not empty
 * - bio: max 300 chars (enforced by DB check constraint)
 * - phone: optional, basic format
 * - region_id: valid UUID
 * - city: optional free text
 * - role: editable in onboarding per spec section 8.1
 */
export const onboardingProfileSchema = z.object({
  full_name: z
    .string({ required_error: 'الاسم الكامل مطلوب' })
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .trim(),

  role: z.enum(['farmer', 'trader', 'citizen'], {
    required_error: 'نوع الحساب مطلوب',
    invalid_type_error: 'نوع الحساب غير صالح',
  }),

  region_id: z
    .string({ required_error: 'الولاية مطلوبة' })
    .uuid('الولاية غير صالحة')
    .min(1, 'الولاية مطلوبة'),

  city: z
    .string()
    .max(100, 'اسم المدينة طويل جداً')
    .trim()
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(
      /^(\+216)?[2-9]\d{7}$/,
      'رقم الهاتف غير صالح. مثال: 20123456 أو +21620123456'
    )
    .optional()
    .or(z.literal('')),

  bio: z
    .string()
    .max(300, 'النبذة يجب أن لا تتجاوز 300 حرف')
    .trim()
    .optional()
    .or(z.literal('')),
    
  avatar: z.any().optional(),
})

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>

// ─── Step 2: Interests ────────────────────────────────────────────────────────

/**
 * Both lists are optional per PRD section 6.3 ("optional but recommended").
 * Max 5 is enforced by DB triggers — we also enforce in frontend and here.
 */
export const onboardingInterestsSchema = z.object({
  activity_ids: z
    .array(z.string().uuid('معرّف الصنف غير صالح'))
    .max(5, 'لا يمكنك اختيار أكثر من 5 أنشطة')
    .default([]),

  followed_region_ids: z
    .array(z.string().uuid('معرّف الولاية غير صالح'))
    .max(5, 'لا يمكنك متابعة أكثر من 5 ولايات')
    .default([]),
})

export type OnboardingInterestsInput = z.infer<typeof onboardingInterestsSchema>
