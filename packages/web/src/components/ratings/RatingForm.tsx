import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { Rating, RatingCategory } from '@/types';

interface RatingFormProps {
  jobId: string;
  rateeId: string;
}

const CATEGORY_OPTIONS: { value: RatingCategory; label: string }[] = [
  { value: 'PUNCTUALITY', label: 'Punctuality' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'PROFESSIONALISM', label: 'Professionalism' },
  { value: 'VALUE', label: 'Value' },
];

const STARS = [1, 2, 3, 4, 5];

export const RatingForm: React.FC<RatingFormProps> = ({ jobId, rateeId }) => {
  const { addToast } = useToast();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState<RatingCategory>('PUNCTUALITY');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score < 1) {
      addToast({
        type: 'warning',
        title: 'Select a rating',
        description: 'Please pick at least one star before submitting.',
      });
      return;
    }

    setLoading(true);
    try {
      await fetchApi<Rating>('/ratings', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          rateeId,
          score,
          comment: comment.trim() || undefined,
          category,
        }),
      });
      setSubmitted(true);
      addToast({ type: 'success', title: 'Rating submitted', description: 'Thank you for your feedback.' });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to submit rating',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <CardTitle className="text-base">Rate this job</CardTitle>
        <CardDescription>Your feedback helps the Loadbyton community.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {STARS.map((star) => {
            const active = star <= (hover || score);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                disabled={submitted}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                className="p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Star
                  className={cn('h-7 w-7 transition-colors', active ? 'fill-brand-orange text-brand-orange' : 'text-gray-300')}
                />
              </button>
            );
          })}
        </div>

        <Select
          label="Category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(event) => setCategory(event.target.value as RatingCategory)}
          disabled={submitted}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Comment</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share details about the experience…"
            disabled={submitted}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button variant="primary" className="w-full" onClick={handleSubmit} disabled={submitted || loading}>
          {submitted ? 'Submitted' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  );
};
