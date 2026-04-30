import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/utils/constants'
import DoneStep from '@/components/onboarding/DoneStep'

export const metadata: Metadata = {
  title: 'مرحباً بك!',
}

/**
 * Onboarding Step 3 — Server Component.
 * Fetches: profile full_name to personalise the welcome message.
 * Renders: DoneStep (client) which calls completeOnboardingAction on button press.
 *
 * Guard: if profile step not saved redirect back to step 1.
 */
export default async function OnboardingDonePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await (supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as any)

  if (!profile?.full_name) {
    redirect(ROUTES.ONBOARDING_PROFILE)
  }

  return <DoneStep fullName={profile.full_name} />
}
