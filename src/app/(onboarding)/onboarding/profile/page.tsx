import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'
import ProfileForm from '@/components/onboarding/ProfileForm'

export const metadata: Metadata = {
  title: 'أكمل ملفك الشخصي',
}

/**
 * Onboarding Step 1 — Server Component.
 * Fetches: regions list + current profile defaults.
 * Renders: ProfileForm (client) pre-filled with existing data.
 */
export default async function OnboardingProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch regions for the select dropdown (catalog — public read RLS)
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name_ar')
    .order('sort_order', { ascending: true })

  // Fetch current profile to pre-fill the form
  const { data: profile } = await (supabase
    .from('profiles')
    .select('full_name, role, region_id, city, phone, bio')
    .eq('id', user.id)
    .single() as any)

  return (
    <ProfileForm
      regions={regions ?? []}
      defaultValues={{
        full_name: profile?.full_name ?? '',
        role:      profile?.role ?? 'citizen',
        region_id: profile?.region_id ?? null,
        city:      profile?.city ?? null,
        phone:     profile?.phone ?? null,
        bio:       profile?.bio ?? null,
      }}
    />
  )
}
