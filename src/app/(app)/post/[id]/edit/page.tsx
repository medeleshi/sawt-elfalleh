import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostForm from '@/components/posts/PostForm'
import { getPostForEdit } from '@/actions/posts.actions'
import { ROUTES } from '@/lib/utils/constants'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `تعديل الإعلان — صوت الفلاح` }
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await (supabase
    .from('profiles')
    .select('id, role, is_profile_completed')
    .eq('id', user.id)
    .single() as any)

  if (!profile || !profile.is_profile_completed) redirect(ROUTES.ONBOARDING_PROFILE)

  // Fetch post with ownership check
  const post = await getPostForEdit(id) as any

  if (!post) notFound()

  // Cannot edit deleted or suspended posts
  if (post.status === 'deleted' || post.status === 'suspended') {
    redirect(ROUTES.PROFILE_ME)
  }

  // Fetch catalog data
  const [
    { data: regions },
    { data: categories },
    { data: units },
  ] = await Promise.all([
    supabase.from('regions').select('id, name_ar, name_fr, code, sort_order, created_at').order('sort_order'),
    supabase.from('categories').select('id, name_ar, name_fr, slug, icon, parent_id, sort_order, is_active, created_at').eq('is_active', true).order('sort_order'),
    supabase.from('units').select('id, name_ar, name_fr, symbol, sort_order, created_at').order('sort_order'),
  ])

  // Map existing images to UploadedImage shape
  const initialImages = (post.post_images ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => ({
      clientId:     img.id,
      url:          img.url,
      storage_path: img.storage_path,
      sort_order:   img.sort_order,
    }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">تعديل الإعلان</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عدّل بيانات إعلانك ثم احفظ التغييرات
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <PostForm
          mode="edit"
          postId={id}
          userRole={profile.role}
          regions={regions ?? []}
          categories={categories ?? []}
          units={units ?? []}
          initialData={{
            type:          post.type,
            category_id:   post.category_id,
            title:         post.title,
            description:   post.description ?? '',
            quantity:      post.quantity,
            unit_id:       post.unit_id,
            price:         post.price,
            is_negotiable: post.is_negotiable,
            region_id:     post.region_id,
            city:          post.city ?? '',
            images:        initialImages,
          }}
        />
      </div>
    </div>
  )
}
