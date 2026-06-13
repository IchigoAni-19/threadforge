import type { Post } from '@/types/post.types';

import { PostCard } from '@/components/posts/PostCard';

interface PostListProps {
  posts: Post[];
}

/**
 * Renders a vertical list of PostCard components.
 * Separated from the page so the dashboard stays readable.
 */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-600">No posts yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
