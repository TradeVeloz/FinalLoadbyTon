import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { Rating, RatingCategory } from '@/types';

interface RatingListProps {
  userId: string;
}

interface RatingResponse {
  ratings: Rating[];
  average: number;
  count: number;
}

const CATEGORY_LABEL: Record<RatingCategory, string> = {
  PUNCTUALITY: 'Punctuality',
  COMMUNICATION: 'Communication',
  PROFESSIONALISM: 'Professionalism',
  VALUE: 'Value',
};

const STAR_VALUES = [1, 2, 3, 4, 5];

export const RatingList: React.FC<RatingListProps> = ({ userId }) => {
  const { addToast } = useToast();
  const [data, setData] = useState<RatingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchApi<RatingResponse>(`/ratings/user/${userId}`)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err: unknown) => {
        if (active) {
          addToast({
            type: 'error',
            title: 'Failed to load ratings',
            description: err instanceof Error ? err.message : 'Please try again.',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, addToast]);

  const renderStars = (value: number) => (
    <div className="flex gap-0.5">
      {STAR_VALUES.map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3.5 w-3.5',
            star <= Math.round(value) ? 'fill-brand-orange text-brand-orange' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <CardTitle>Ratings &amp; Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading ratings…</p>
        ) : !data || data.count === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No ratings yet</p>
            <p className="mt-1 text-xs text-gray-400">Reviews appear here once a job is completed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="font-mono text-4xl font-bold text-navy-900">{data.average.toFixed(1)}</p>
              <div className="space-y-1">
                {renderStars(data.average)}
                <p className="text-xs text-gray-500">
                  {data.count} rating{data.count === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {data.ratings.map((rating) => (
                <li key={rating.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy-800">{rating.raterName ?? 'Anonymous'}</p>
                    <Badge variant="teal">{CATEGORY_LABEL[rating.category]}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {renderStars(rating.score)}
                    <p className="text-xs text-gray-400">{new Date(rating.createdAt).toLocaleDateString()}</p>
                  </div>
                  {rating.comment && <p className="mt-2 text-sm leading-relaxed text-gray-600">{rating.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
