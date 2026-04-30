import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم طويل جداً'),
  bio: z
    .string()
    .max(300, 'النبذة لا يمكن أن تتجاوز 300 حرف')
    .optional()
    .nullable(),
  region_id: z.string().uuid('الولاية غير صالحة').optional().nullable(),
  city: z
    .string()
    .max(100, 'اسم المدينة طويل جداً')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9+\s]{8,20}$/, 'رقم الهاتف غير صالح')
    .optional()
    .nullable(),
  show_phone: z.boolean().optional(),
  avatar_url: z.string().url('رابط الصورة غير صالح').optional().nullable(),
  activity_ids: z
    .array(z.string().uuid())
    .max(5, 'لا يمكنك اختيار أكثر من 5 أنشطة')
    .optional(),
  followed_region_ids: z
    .array(z.string().uuid())
    .max(5, 'لا يمكنك متابعة أكثر من 5 ولايات')
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateNotificationSettingsSchema = z.object({
  new_post_region: z.boolean(),
  new_post_activity: z.boolean(),
  messages: z.boolean(),
  platform_updates: z.boolean(),
})

export type UpdateNotificationSettingsInput = z.infer<
  typeof updateNotificationSettingsSchema
>
