'use server'

import { createClient } from '@/lib/supabase/server'
import type { ContactType } from '@/types/db'

/**
 * trackContactAction — inserts a row into post_contacts.
 * Called client-side on phone/WhatsApp button click.
 * Returns silently on error (analytics — non-critical).
 */
export async function trackContactAction(
  postId: string,
  contactType: ContactType
): Promise<void> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('post_contacts').insert({
      post_id: postId,
      requester_id: user?.id ?? null,
      contact_type: contactType,
    } as any)
  } catch {
    // Analytics failure is non-critical — silently swallow
  }
}