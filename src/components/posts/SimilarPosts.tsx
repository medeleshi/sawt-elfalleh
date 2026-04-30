// src/components/posts/SimilarPosts.tsx
// Server component

import PostCard from './PostCard'
import type { PostCard as PostCardType } from '@/types/marketplace'

interface Props {
  posts: PostCardType[]
  categoryName: string
}

export default function SimilarPosts({ posts, categoryName }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="similar-posts">
      <h2 className="similar-posts__title">
        إعلانات مشابهة في {categoryName}
      </h2>
      <div className="similar-posts__grid">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
