import { cn } from '@/lib/utils/cn'
import PostCard from '@/components/posts/PostCard'
import EmptyState from '@/components/shared/EmptyState'
import type { PostWithDetails } from '@/types/domain'

interface PostGridProps {
  posts: PostWithDetails[]
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

/**
 * Responsive post card grid.
 * Mobile: 1 column
 * Tablet: 2-3 columns
 * Desktop: 4+ columns
 *
 * Shows EmptyState when posts array is empty.
 */
export default function PostGrid({
  posts,
  emptyTitle = 'لا توجد منشورات',
  emptyDescription,
  className,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
