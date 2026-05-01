// src/actions/contact-form.actions.ts
// Contact form submission — stores to contact_submissions table.
// NOTE: The contact_submissions table must be present in schema.sql and db.ts.
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ─── Schema ───────────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  message: z.string().min(10, 'الرسالة قصيرة جداً').max(2000),
})

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; error: string }
  | { status: 'validation'; fields: Record<string, string> }

// ─── Action ───────────────────────────────────────────────────────────────────

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  }

  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as string
      fields[key] = issue.message
    })
    return { status: 'validation', fields }
  }

  try {
    const supabase = await createClient()

    // TODO: Add contact_submissions to schema.sql, run migration, and regenerate db.ts.
    // The 'as any' cast below is a temporary bridge until the table exists in types.
    // @ts-expect-error - table not yet in db.ts
    const { error } = await (supabase.from('contact_submissions' as any).insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    }) as any)

    if (error) {
      console.error('[submitContactAction] DB error:', error)
      return { status: 'error', error: 'تعذّر إرسال رسالتك. يرجى المحاولة مجدداً.' }
    }

    return { status: 'success' }
  } catch (err) {
    console.error('[submitContactAction] Unexpected error:', err)
    return { status: 'error', error: 'تعذّر إرسال رسالتك. يرجى المحاولة مجدداً.' }
  }
}
