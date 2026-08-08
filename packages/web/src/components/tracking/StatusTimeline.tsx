import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  label: string;
  timestamp: string;
  completed: boolean;
}

interface StatusTimelineProps {
  milestones: Milestone[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ milestones }) => {
  if (milestones.length === 0) {
    return <p className="py-4 text-sm text-gray-400">No milestones recorded yet.</p>;
  }

  return (
    <ol className="space-y-0">
      {milestones.map((milestone, index) => {
        const isLast = index === milestones.length - 1;
        return (
          <li key={`${milestone.label}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full ring-2',
                  milestone.completed
                    ? 'bg-emerald-500 text-white ring-emerald-100'
                    : 'bg-gray-300 text-white ring-gray-100'
                )}
              >
                {milestone.completed && <Check className="h-3.5 w-3.5" />}
              </span>
              {!isLast && <span className="mt-1 w-0.5 flex-1 bg-gray-200" />}
            </div>
            <div className="pt-0.5">
              <p className={cn('text-sm font-semibold', milestone.completed ? 'text-navy-800' : 'text-gray-400')}>
                {milestone.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {milestone.timestamp ? new Date(milestone.timestamp).toLocaleString() : '—'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
