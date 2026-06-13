import { useCallback, useEffect, useState } from 'react';

import * as postsApi from '@/api/posts.api';
import { PostForm } from '@/components/posts/PostForm';
import { PostList } from '@/components/posts/PostList';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import type { ApiError } from '@/types/api.types';
import type { Post } from '@/types/post.types';

/**
 * Dashboard — the main authenticated landing page.
 *
 * Shows:
 * - Logged-in user profile and credits
 * - Form to create a new post
 * - List of all posts
 */
export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await postsApi.fetchPosts();
      setPosts(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    refreshUser();
  }, [loadPosts, refreshUser]);

  const handlePostCreated = async () => {
    await refreshUser();
    await loadPosts();
  };

  return (
    <div className="space-y-8">
      {/* User profile summary */}
      {user && (
        <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-100">Welcome back</p>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="mt-1 text-sm text-brand-100">{user.email}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-6 py-4 text-center backdrop-blur">
              <p className="text-3xl font-bold">{user.credits}</p>
              <p className="text-sm text-brand-100">Credits earned</p>
            </div>
          </div>
        </Card>
      )}

      <PostForm onPostCreated={handlePostCreated} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">All discussions</h2>
          <button
            type="button"
            onClick={loadPosts}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadPosts} />}

        {isLoading ? <LoadingSpinner label="Loading posts..." /> : <PostList posts={posts} />}
      </section>
    </div>
  );
}
