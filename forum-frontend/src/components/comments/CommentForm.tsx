import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface CommentFormProps {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Reusable comment/reply form.
 * Used for both root comments (on a post) and nested replies.
 */
export function CommentForm({
  placeholder = 'Write a comment...',
  submitLabel = 'Post comment',
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(content.trim());
      setContent('');
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        label=""
        aria-label="Comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        required
        className="min-h-[80px]"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
