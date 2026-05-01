import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMySavedPosts } from '@/lib/queries/profile.queries'
import PostCard from '@/components/posts/PostCard'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'
import { ROUTES } from '@/lib/utils/constants'
import Link from 'next/link'

export const metadata = {
  title: 'الإعلانات المحفوظة',
}

interface Props {
  searchParams: { page?: string }
}

export default async function SavedPostsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const page = parseInt(searchParams.page || '1', 10)
  const { savedPosts, pagination } = await getMySavedPosts(user.id, page)

  return (
    <div className="container py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعلانات المحفوظة</h1>
          <p className="text-slate-500">الإعلانات التي قمت بحفظها للرجوع إليها لاحقاً</p>
        </header>

        {savedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedPosts.map((saved: any) => (
                <PostCard 
                  key={saved.id} 
                  post={saved.posts} 
                  initialIsSaved={true} 
                />
              ))}
            </div>
            
            <div className="mt-8">
              <Pagination pagination={pagination} />
            </div>
          </>
        ) : (
          <EmptyState
            title="لا توجد إعلانات محفوظة"
            description="لم تقم بحفظ أي إعلان بعد. تصفح السوق وقم بحفظ الإعلانات التي تهمك."
            action={
              <Link href={ROUTES.MARKETPLACE} className="btn btn--primary">
                تصفح السوق
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
