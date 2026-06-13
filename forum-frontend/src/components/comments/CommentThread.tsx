import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import * as commentsApi from '@/api/comments.api';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentItem } from '@/components/comments/CommentItem';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import type { ApiError } from '@/types/api.types';
import { buildCommentTree } from '@/utils/buildCommentTree';

interface CommentThreadProps {
  postId: string;
}

/**
 * Container for the entire comment section on a post detail page.
 *
 * Responsibilities:
 * 1. Fetch flat comments from API
 * 2. Convert to tree via buildCommentTree()
 * 3. Render root CommentItem nodes (which recurse into children)
 * 4. Provide root-level comment form
 */
export function CommentThread({ postId }: CommentThreadProps) {
  const { isAuthenticated, refreshUser } = useAuth();
  const [flatComments, setFlatComments] = useState<Awaited<ReturnType<typeof commentsApi.fetchCommentsByPost>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await commentsApi.fetchCommentsByPost(postId);
      setFlatComments(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // useMemo: only rebuild the tree when flatComments changes
  const commentTree = useMemo(
    () => buildCommentTree(flatComments),
    [flatComments],
  );

  const handleRootComment = async (content: string) => {
    await commentsApi.createComment({ content, postId });
    await refreshUser();
    await loadComments();
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading comments..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Comments ({flatComments.length})
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Nested replies earn more credits for the original poster.
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadComments} />}

      {isAuthenticated && (
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Add a comment</h3>
          <CommentForm onSubmit={handleRootComment} />
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {commentTree.length === 0 ? (
        <p className="text-sm text-slate-500">No comments yet. Start the conversation!</p>
      ) : (
        <div className="space-y-4">
          {commentTree.map((node) => (
            <CommentItem
              key={node.comment._id}
              node={node}
              postId={postId}
              onCommentChanged={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
