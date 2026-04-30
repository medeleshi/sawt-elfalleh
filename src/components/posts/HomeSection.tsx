import SectionHeader from '@/components/shared/SectionHeader'
import PostGrid from '@/components/posts/PostGrid'
import type { PostWithDetails } from '@/types/domain'

interface HomeSectionProps {
  title: string
  posts: PostWithDetails[]
  viewMoreHref: string
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * One feed section on the home page.
 * Renders: title + "View More" link → PostGrid (or EmptyState).
 * Used 4 times on the home page for the 4 personalized sections.
 */
export default function HomeSection({
  title,
  posts,
  viewMoreHref,
  emptyTitle,
  emptyDescription,
}: HomeSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title={title}
        viewMoreHref={viewMoreHref}
        viewMoreLabel="عرض المزيد"
      />
      <PostGrid
        posts={posts}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </section>
  )
}
