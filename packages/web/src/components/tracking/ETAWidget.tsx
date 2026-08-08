import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';

interface ETAWidgetProps {
  etaMinutes?: number;
  status?: string;
}

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  pending: 'open',
  open: 'open',
  bidding: 'bidding',
  awarded: 'awarded',
  in_transit: 'in_transit',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const ETAWidget: React.FC<ETAWidgetProps> = ({ etaMinutes, status }) => {
  const percent =
    etaMinutes === undefined ? 0 : Math.max(0, Math.min(100, ((120 - etaMinutes) / 120) * 100));
  const variant = status ? STATUS_VARIANT[status.toLowerCase()] ?? 'outline' : undefined;

  return (
    <Card className="shadow-premium">
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">ETA</p>
          {status && (
            <Badge variant={variant}>
              {status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </Badge>
          )}
        </div>
        <p className="mt-2 font-mono text-4xl font-bold text-navy-900">
          {etaMinutes !== undefined ? `${Math.round(etaMinutes)} min` : '—'}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-teal to-emerald-400"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">Estimated arrival · Dubai local time</p>
      </CardContent>
    </Card>
  );
};
