import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Gavel, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useBids } from '@/hooks/useBids';
import { useToast } from '@/hooks/useToast';
import { useSocketContext } from '@/contexts/SocketContext';
import { Bid, BidStatus } from '@/types';
import { cn, formatCurrencyAED } from '@/lib/utils';

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

type SortKey = 'amountAED' | 'etaMinutes' | 'carrierRating';
type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const SORTABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'amountAED', label: 'Amount' },
  { key: 'etaMinutes', label: 'ETA' },
  { key: 'carrierRating', label: 'Rating' },
];

export const BidList: React.FC<{ jobId: string; onJobChanged?: () => void }> = ({ jobId, onJobChanged }) => {
  const { role } = useAuth();
  const { listBids, acceptBid, rejectBid } = useBids();
  const { addToast } = useToast();
  const { on } = useSocketContext();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'amountAED', direction: 'asc' });

  const loadBids = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBids(jobId);
      setBids(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, [jobId, listBids]);

  useEffect(() => {
    void loadBids();
  }, [loadBids]);

  useEffect(() => {
    const offs = [
      on('bid:new', () => void loadBids()),
      on('bid:accepted', () => void loadBids()),
      on('bid:rejected', () => void loadBids()),
      on('bid:updated', () => void loadBids()),
    ];
    return () => offs.forEach((off) => off());
  }, [on, loadBids]);

  const hasAccepted = useMemo(() => bids.some((b) => b.status === 'ACCEPTED'), [bids]);

  const lowestPendingAmount = useMemo(() => {
    const pending = bids.filter((b) => b.status === 'PENDING');
    if (pending.length === 0) return null;
    return Math.min(...pending.map((b) => b.amountAED));
  }, [bids]);

  const sortedBids = useMemo(() => {
    const sorted = [...bids].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      const diff = aVal - bVal;
      return sort.direction === 'asc' ? diff : -diff;
    });
    return sorted;
  }, [bids, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const handleAccept = async (bid: Bid) => {
    if (!window.confirm(`Accept bid from ${bid.carrierName} for ${formatCurrencyAED(bid.amountAED)}?`)) {
      return;
    }
    try {
      await acceptBid(bid.id);
      addToast({
        type: 'success',
        title: 'Bid accepted',
        description: `${bid.carrierName} has been awarded the load.`,
      });
      void loadBids();
      onJobChanged?.();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could not accept bid',
        description: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  };

  const handleReject = async (bid: Bid) => {
    try {
      await rejectBid(bid.id);
      addToast({
        type: 'info',
        title: 'Bid rejected',
        description: `Rejected ${bid.carrierName}'s bid of ${formatCurrencyAED(bid.amountAED)}.`,
      });
      void loadBids();
      onJobChanged?.();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could not reject bid',
        description: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  };

  const displayStatus = (bid: Bid): BidStatus => {
    if (bid.status === 'PENDING' && hasAccepted) return 'REJECTED';
    return bid.status;
  };

  if (loading && bids.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
        <p className="text-sm font-semibold text-red-700">Failed to load bids</p>
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" onClick={() => void loadBids()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy-900">Bids</h2>
        {bids.length > 0 && (
          <span className="text-xs text-gray-500">
            {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
          </span>
        )}
      </div>

      {bids.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center space-y-2">
          <Gavel className="w-8 h-8 mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-navy-800">No bids yet</p>
          <p className="text-xs text-gray-500">Bids from carriers will appear here.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carrier</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              {SORTABLE_COLUMNS.map((col) => (
                <TableHead key={col.key}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      'inline-flex items-center gap-1 uppercase tracking-wider text-xs font-bold',
                      sort.key === col.key ? 'text-brand-orange' : 'text-navy-800',
                    )}
                  >
                    {col.label}
                    {sort.key === col.key ? (
                      sort.direction === 'asc' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </TableHead>
              ))}
              <TableHead>Truck</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBids.map((bid) => {
              const status = displayStatus(bid);
              const isRecommended =
                bid.status === 'PENDING' && lowestPendingAmount != null && bid.amountAED === lowestPendingAmount;
              return (
                <TableRow key={bid.id}>
                  <TableCell>
                    <p className="font-semibold text-navy-800">{bid.carrierName}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {bid.carrierRating.toFixed(1)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">{bid.completedJobs}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'font-mono font-bold',
                        isRecommended ? 'text-emerald-600' : 'text-navy-800',
                      )}
                    >
                      {formatCurrencyAED(bid.amountAED)}
                    </span>
                    {isRecommended && (
                      <Badge variant="teal" className="ml-2">
                        Recommended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{bid.etaMinutes} min</TableCell>
                  <TableCell className="text-gray-600">{bid.truckType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {role === 'SHIPPER' && status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="teal" size="sm" onClick={() => void handleAccept(bid)}>
                          Accept
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void handleReject(bid)}>
                          Reject
                        </Button>
                      </div>
                    )}
                    {role !== 'SHIPPER' && <span className="text-xs text-gray-400">—</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
