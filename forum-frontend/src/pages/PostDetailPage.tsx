import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import * as postsApi from '@/api/posts.api';
import { CommentThread } from '@/components/comments/CommentThread';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ApiError } from '@/types/api.types';
import type { Post } from '@/types/post.types';
import { formatDate } from '@/utils/formatDate';

/**
 * Single post detail page with full content and nested comments.
 * Public route — anyone can read; auth required only for commenting.
 */
export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!id) return;

    setError(null);
    setIsLoading(true);

    try {
      const data = await postsApi.fetchPostById(id);
      setPost(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (isLoading) {
    return <LoadingSpinner label="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <ErrorMessage message={error ?? 'Post not found'} onRetry={loadPost} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>

      <Card>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{post.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>
            By{' '}
            <span className="font-medium text-slate-700">{post.author.name}</span>
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {post.author.credits} credits
          </span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <p className="mt-6 whitespace-pre-wrap text-slate-700 leading-relaxed">{post.body}</p>
      </Card>

      <CommentThread postId={post._id} />
    </div>
  );
}
