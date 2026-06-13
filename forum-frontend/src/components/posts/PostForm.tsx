import { FormEvent, useState } from 'react';

import * as postsApi from '@/api/posts.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ApiError } from '@/types/api.types';

interface PostFormProps {
  /** Called after a post is successfully created so the parent can refresh the list. */
  onPostCreated: () => void | Promise<void>;
}

/**
 * Form for creating a new post (protected — user must be logged in).
 * Calls the API layer, then notifies the parent via onPostCreated callback.
 */
export function PostForm({ onPostCreated }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await postsApi.createPost({ title, body });
      await onPostCreated();
      setTitle('');
      setBody('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Create a new post</h2>
      <p className="mt-1 text-sm text-slate-500">
        Start a discussion. Other users can comment and earn you credits.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What would you like to discuss?"
          required
        />

        <Textarea
          label="Body"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts..."
          required
        />

        {error && <ErrorMessage message={error} />}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish post'}
        </Button>
      </form>
    </Card>
  );
}
