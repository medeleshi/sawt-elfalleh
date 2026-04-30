import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostForm from '@/components/posts/PostForm'
import { ROUTES } from '@/lib/utils/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'نشر إعلان جديد — صوت الفلاح',
}

export default async function NewPostPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await (supabase
    .from('profiles')
    .select('id, role, is_profile_completed')
    .eq('id', user.id)
    .single() as any)

  if (!profile || !profile.is_profile_completed) redirect(ROUTES.ONBOARDING_PROFILE)
  if (profile.role === 'admin') redirect(ROUTES.HOME)

  const [
    { data: regions },
    { data: categories },
    { data: units },
  ] = await Promise.all([
    supabase.from('regions').select('id, name_ar, name_fr, code, sort_order, created_at').order('sort_order'),
    supabase.from('categories').select('id, name_ar, name_fr, slug, icon, parent_id, sort_order, is_active, created_at').eq('is_active', true).order('sort_order'),
    supabase.from('units').select('id, name_ar, name_fr, symbol, sort_order, created_at').order('sort_order'),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">نشر إعلان جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          أكمل البيانات أدناه لنشر إعلانك في السوق الفلاحي
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <PostForm
          mode="create"
          userRole={profile.role}
          regions={regions ?? []}
          categories={categories ?? []}
          units={units ?? []}
        />
      </div>
    </div>
  )
}
