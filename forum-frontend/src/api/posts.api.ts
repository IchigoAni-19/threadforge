/**
 * Posts API.
 */

import { apiClient } from '@/api/axios';
import type { ApiResponse } from '@/types/api.types';
import type { CreatePostPayload, Post } from '@/types/post.types';

export async function fetchPosts(): Promise<Post[]> {
  const { data } = await apiClient.get<ApiResponse<Post[]>>('/posts');
  return data.data ?? [];
}

export async function fetchPostById(id: string): Promise<Post> {
  const { data } = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
  return data.data!;
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const { data } = await apiClient.post<ApiResponse<Post>>('/posts', payload);
  return data.data!;
}
