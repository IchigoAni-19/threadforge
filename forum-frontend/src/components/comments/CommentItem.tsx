import { useState } from 'react';

import * as commentsApi from '@/api/comments.api';
import { CommentForm } from '@/components/comments/CommentForm';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { CommentNode } from '@/types/comment.types';
import { formatDate } from '@/utils/formatDate';
import { getCommentAuthorId } from '@/utils/getUserId';

interface CommentItemProps {
  node: CommentNode;
  postId: string;
  depth?: number;
  onCommentChanged: () => void;
}

/**
 * RECURSIVE COMMENT RENDERING
 *
 * This component renders ONE comment node, then maps over `node.children`
 * and renders a CommentItem for each child — calling itself recursively.
 *
 * Visual nesting:
 * - Each level adds left padding (pl-6) and a left border
 * - Creates the tree appearance:
 *
 *   Comment A
 *   └── Comment B
 *       └── Comment C
 *
 * React concept: RECURSION
 * A component can render itself with different props (deeper children).
 * Each recursive call is independent — React tracks them by `key`.
 */
export function CommentItem({
  node,
  postId,
  depth = 0,
  onCommentChanged,
}: CommentItemProps) {
  const { comment, children } = node;
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorId = getCommentAuthorId(comment.author);
  const authorName =
    typeof comment.author === 'string' ? 'Unknown' : comment.author.name;

  const isOwnComment = user?.id === authorId;
  const isDeleted = comment.isDeleted;

  const handleReply = async (content: string) => {
    await commentsApi.replyToComment({
      content,
      postId,
      parentCommentId: comment._id,
    });
    await refreshUser();
    onCommentChanged();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment? Credits will be rolled back from the post author.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await commentsApi.deleteComment(comment._id);
      await refreshUser();
      onCommentChanged();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={depth > 0 ? 'ml-4 border-l-2 border-slate-200 pl-4 sm:ml-6' : ''}
    >
      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isDeleted ? '[deleted]' : authorName}
            </p>
            <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
          </div>

          {!isDeleted && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              +{comment.reward} credits to OP
            </span>
          )}
        </div>

        <p className={`mt-3 text-sm ${isDeleted ? 'italic text-slate-400' : 'text-slate-700'}`}>
          {isDeleted ? 'This comment has been deleted.' : comment.content}
        </p>

        {isAuthenticated && !isDeleted && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => setShowReplyForm((prev) => !prev)}
            >
              {showReplyForm ? 'Hide reply' : 'Reply'}
            </Button>

            {isOwnComment && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        )}

        {showReplyForm && !isDeleted && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <CommentForm
              placeholder={`Reply to ${authorName}...`}
              submitLabel="Post reply"
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </article>

      {/* RECURSIVE STEP: render each child comment at depth + 1 */}
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((childNode) => (
            <CommentItem
              key={childNode.comment._id}
              node={childNode}
              postId={postId}
              depth={depth + 1}
              onCommentChanged={onCommentChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
