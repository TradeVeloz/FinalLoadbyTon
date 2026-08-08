import React from 'react';
import { Star, Clock, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Bid, BidStatus } from '@/types';
import { formatCurrencyAED } from '@/lib/utils';

const statusVariantMap: Record<BidStatus, NonNullable<BadgeProps['variant']>> = {
  PENDING: 'bidding',
  ACCEPTED: 'awarded',
  REJECTED: 'cancelled',
  EXPIRED: 'outline',
};

const statusLabelMap: Record<BidStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export const BidCard: React.FC<{ bid: Bid }> = ({ bid }) => (
  <Card className="shadow-sm">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-navy-800">{bid.carrierName}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {bid.carrierRating.toFixed(1)}
            <span className="text-gray-400">· {bid.completedJobs} jobs</span>
          </p>
        </div>
        <Badge variant={statusVariantMap[bid.status]}>{statusLabelMap[bid.status]}</Badge>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="font-mono text-xl font-bold text-brand-teal">
          {formatCurrencyAED(bid.amountAED)}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {bid.etaMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-gray-400" />
            {bid.truckType}
          </span>
        </div>
      </div>

      {bid.driverName && <p className="text-xs text-gray-500">Driver: {bid.driverName}</p>}

      {bid.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">
          {bid.notes}
        </p>
      )}
    </CardContent>
  </Card>
);
