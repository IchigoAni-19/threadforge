import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import type { Post } from '@/types/post.types';
import { formatDate } from '@/utils/formatDate';

interface PostCardProps {
  post: Post;
}

/**
 * Summary card for a single post in the dashboard list.
 * Clicking the title navigates to the full post detail page.
 */
export function PostCard({ post }: PostCardProps) {
  const preview =
    post.body.length > 160 ? `${post.body.slice(0, 160)}...` : post.body;

  return (
    <Card className="transition hover:border-brand-300 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Link
            to={`/posts/${post._id}`}
            className="text-lg font-semibold text-slate-900 hover:text-brand-600"
          >
            {post.title}
          </Link>
          <p className="mt-2 text-sm text-slate-600">{preview}</p>
        </div>

        <div className="shrink-0 text-right text-xs text-slate-500">
          <p className="font-medium text-slate-700">{post.author.name}</p>
          <p>{post.author.credits} credits</p>
          <p className="mt-1">{formatDate(post.createdAt)}</p>
        </div>
      </div>
    </Card>
  );
}
