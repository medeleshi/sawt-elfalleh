'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Record post view ─────────────────────────────────────────────────────────

/**
 * Insert a post_views row.
 * Called from the post details page on load (server action).
 * viewer_id is nullable — works for both logged-in and anonymous users.
 */
export async function recordPostView(postId: string, viewerId: string | null): Promise<void> {
  const supabase = await createClient()

  await (supabase
    .from('post_views')
    .insert({
      post_id: postId,
      viewer_id: viewerId ?? null,
    } as any) as any)
  // Non-fatal — we silently ignore errors
}

// ─── Record contact click ─────────────────────────────────────────────────────

/**
 * Insert a post_contacts row when a user clicks phone or WhatsApp.
 * contact_type: 'phone' | 'whatsapp'
 */
export async function recordPostContact(
  postId: string,
  contactType: 'phone' | 'whatsapp',
  contactorId: string | null
): Promise<void> {
  const supabase = await createClient()

  await (supabase
    .from('post_contacts')
    .insert({
      post_id: postId,
      contact_type: contactType,
      contactor_id: contactorId ?? null,
    } as any) as any)
  // Non-fatal — silently ignore errors
}
