// src/components/posts/SimilarPosts.tsx
// Server component

import PostCard from '@/components/posts/PostCard'
import type { SimilarPost } from '@/lib/queries/post-details'
import type { PostCard as PostCardType } from '@/types/marketplace'

interface Props {
  posts: SimilarPost[]
}

export default function SimilarPosts({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="similar-posts">
      <div className="similar-posts__header">
        <h2 className="similar-posts__title">
          <span>منشورات مشابهة</span>
        </h2>
      </div>

      <div className="post-grid post-grid--4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post as unknown as PostCardType}
          />
        ))}
      </div>
    </section>
  )
}
