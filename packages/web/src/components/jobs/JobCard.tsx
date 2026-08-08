import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CalendarClock, Gavel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Job, JobStatus } from '@/types';
import {
  cn,
  formatCurrencyAED,
  formatTerminalName,
  formatDeliveryArea,
  formatContainerSize,
} from '@/lib/utils';

const statusVariantMap: Record<JobStatus, NonNullable<BadgeProps['variant']>> = {
  DRAFT: 'outline',
  OPEN: 'open',
  BIDDING: 'bidding',
  AWARDED: 'awarded',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const statusLabelMap: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  BIDDING: 'Bidding',
  AWARDED: 'Awarded',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AE', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const price = job.agreedPriceAED ?? job.lowestBidAED ?? job.maxBudgetAED;
  const priceLabel =
    job.agreedPriceAED != null
      ? 'Agreed'
      : job.lowestBidAED != null
        ? 'Lowest bid'
        : job.maxBudgetAED != null
          ? 'Budget'
          : null;

  return (
    <Card className="h-full group hover:shadow-premium hover:border-brand-orange/40 transition-shadow duration-200">
      <Link to={`/jobs/${job.id}`} className="block h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-sm font-bold text-navy-800">
              {job.jobCode}
            </span>
            <Badge variant={statusVariantMap[job.status]}>{statusLabelMap[job.status]}</Badge>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {formatContainerSize(job.containerSize)}
            </p>
            <p className="text-xs text-gray-500">{job.containerType.replace(/_/g, ' ').toLowerCase()}</p>
            {job.containerNumber && (
              <p className="mt-1 font-mono text-xs text-navy-700">{job.containerNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs text-gray-700">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
              <span>
                {formatTerminalName(job.pickupTerminal)} <span className="text-gray-400">→</span>{' '}
                {formatDeliveryArea(job.deliveryArea)}
              </span>
            </p>
            <p className="pl-5 text-xs text-gray-500">{job.deliveryAddress}</p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                {formatTime(job.readyTime)}
              </span>
              {job.bidsCount != null && (
                <span className={cn('flex items-center gap-1', job.bidsCount > 0 && 'text-brand-orange')}>
                  <Gavel className="w-3.5 h-3.5" />
                  {job.bidsCount} {job.bidsCount === 1 ? 'bid' : 'bids'}
                </span>
              )}
            </div>
            {price != null && (
              <div className="text-right">
                <p className="text-xs text-gray-400">{priceLabel}</p>
                <p className="font-mono text-sm font-bold text-brand-teal">
                  {formatCurrencyAED(price)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
