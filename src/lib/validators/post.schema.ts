import { z } from 'zod'

/**
 * Post form validation — mirrors posts table constraints exactly.
 * Rules from PRD §9.2:
 *  - title: 5–100 chars
 *  - description: max 1000 chars
 *  - quantity: > 0
 *  - price: >= 0
 *  - type: sell | buy
 *  - citizen cannot post sell (enforced by RLS; hidden in UI via role check)
 */
export const postSchema = z.object({
  type: z.enum(['sell', 'buy'], {
    required_error: 'نوع الإعلان مطلوب',
    invalid_type_error: 'نوع الإعلان غير صالح',
  }),

  category_id: z
    .string({ required_error: 'الصنف مطلوب' })
    .uuid('الصنف غير صالح')
    .min(1, 'الصنف مطلوب'),

  title: z
    .string({ required_error: 'عنوان الإعلان مطلوب' })
    .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
    .max(100, 'العنوان يجب أن لا يتجاوز 100 حرف')
    .trim(),

  description: z
    .string()
    .max(1000, 'الوصف يجب أن لا يتجاوز 1000 حرف')
    .trim()
    .optional()
    .or(z.literal('')),

  quantity: z.coerce
    .number({ required_error: 'الكمية مطلوبة', invalid_type_error: 'الكمية يجب أن تكون رقماً' })
    .positive('الكمية يجب أن تكون أكبر من الصفر')
    .max(999999, 'الكمية كبيرة جداً'),

  unit_id: z
    .string({ required_error: 'وحدة القياس مطلوبة' })
    .uuid('وحدة القياس غير صالحة')
    .min(1, 'وحدة القياس مطلوبة'),

  price: z.coerce
    .number({ required_error: 'السعر مطلوب', invalid_type_error: 'السعر يجب أن يكون رقماً' })
    .min(0, 'السعر لا يمكن أن يكون سالباً')
    .max(9999999, 'السعر كبير جداً'),

  is_negotiable: z
    .boolean()
    .default(false),

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

  /**
   * JSON-serialized array of { url, storage_path, sort_order }
   * Uploaded client-side before form submission.
   */
  images: z
    .string()
    .optional()
    .or(z.literal('')),
})

export type PostInput = z.infer<typeof postSchema>

// ─── Edit variant — same rules ────────────────────────────────────────────────
export const postEditSchema = postSchema

export type PostEditInput = z.infer<typeof postEditSchema>

// ─── Image shape (parsed from JSON) ──────────────────────────────────────────
export const postImageItemSchema = z.object({
  url:          z.string().url(),
  storage_path: z.string().min(1),
  sort_order:   z.number().int().min(0),
})

export type PostImageItem = z.infer<typeof postImageItemSchema>
