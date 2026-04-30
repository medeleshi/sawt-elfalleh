import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'
import InterestsForm from '@/components/onboarding/InterestsForm'

export const metadata: Metadata = {
  title: 'اهتماماتك',
}

/**
 * Onboarding Step 2 — Server Component.
 * Fetches: active categories + regions.
 * Renders: InterestsForm (client) with chip selectors.
 *
 * Guard: if profile step not saved (no full_name) redirect back to step 1.
 */
export default async function OnboardingInterestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Guard: ensure step 1 was completed (has a full_name)
  const { data: profile } = await (supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as any)

  if (!profile?.full_name) {
    redirect(ROUTES.ONBOARDING_PROFILE)
  }

  // Fetch active categories only (catalog RLS allows public read)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch all regions for followed regions selector
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name_ar')
    .order('sort_order', { ascending: true })

  return (
    <InterestsForm
      categories={categories ?? []}
      regions={regions ?? []}
    />
  )
}
