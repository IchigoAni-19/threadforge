/**
 * Comments API.
 */

import { apiClient } from '@/api/axios';
import type { ApiResponse } from '@/types/api.types';
import type {
  Comment,
  CreateCommentPayload,
  ReplyCommentPayload,
} from '@/types/comment.types';

export async function fetchCommentsByPost(postId: string): Promise<Comment[]> {
  const { data } = await apiClient.get<ApiResponse<Comment[]>>(
    `/comments/post/${postId}`,
  );
  return data.data ?? [];
}

export async function createComment(payload: CreateCommentPayload): Promise<Comment> {
  const { data } = await apiClient.post<ApiResponse<Comment>>('/comments', payload);
  return data.data!;
}

export async function replyToComment(payload: ReplyCommentPayload): Promise<Comment> {
  const { data } = await apiClient.post<ApiResponse<Comment>>(
    '/comments/reply',
    payload,
  );
  return data.data!;
}

export async function deleteComment(commentId: string): Promise<Comment> {
  const { data } = await apiClient.delete<ApiResponse<Comment>>(
    `/comments/${commentId}`,
  );
  return data.data!;
}
