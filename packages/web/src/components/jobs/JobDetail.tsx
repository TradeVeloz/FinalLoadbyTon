import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { BidList } from '@/components/bids/BidList';
import { SubmitBid } from '@/components/bids/SubmitBid';
import { Chat } from '@/components/messaging/Chat';
import { EscrowPayment } from '@/components/payments/EscrowPayment';
import { Job, JobStatus } from '@/types';
import {
  formatCurrencyAED,
  formatContainerSize,
  pickupLabel,
  dropLabel,
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
    <dd className="sm:col-span-2 text-sm font-medium text-navy-800">{value}</dd>
  </div>
);

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { getJob } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No job id provided');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getJob(id)
      .then((data) => {
        if (!cancelled) setJob(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load job');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getJob]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-48 w-full bg-gray-200 rounded-xl" />
        <div className="h-64 w-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
          <AlertTriangle className="w-4 h-4" />
          Could not load this job
        </div>
        <p className="text-sm text-red-600">{error ?? 'Job not found.'}</p>
        <Link to="/jobs" className="inline-flex">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to loads
          </Button>
        </Link>
      </div>
    );
  }

  const openToBids = job.status === 'OPEN' || job.status === 'BIDDING';
  const price = job.agreedPriceAED ?? job.lowestBidAED ?? job.maxBudgetAED;
  const priceLabel =
    job.agreedPriceAED != null
      ? 'Agreed price'
      : job.lowestBidAED != null
        ? 'Lowest bid'
        : job.maxBudgetAED != null
          ? 'Maximum budget'
          : null;

  const pickup = pickupLabel(job);
  const drop = dropLabel(job);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/jobs" className="text-gray-500 hover:text-navy-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-mono text-2xl font-bold text-navy-900">{job.jobCode}</h1>
          <Badge variant={statusVariantMap[job.status]}>{statusLabelMap[job.status]}</Badge>
        </div>
        <Link to="/jobs" className="inline-flex">
          <Button variant="outline" size="sm">
            All loads
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Load Details</CardTitle>
          <CardDescription>Full specification for this container move.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <dl>
            <DetailRow
              label="Container"
              value={
                <span className="flex flex-wrap items-center gap-2">
                  {formatContainerSize(job.containerSize)}
                  <span className="text-gray-400">/</span>
                  {job.containerType}
                  {job.containerNumber && (
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">
                      {job.containerNumber}
                    </span>
                  )}
                </span>
              }
            />
            <DetailRow
              label="Route"
              value={
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="break-words">{pickup}</span>
                  <span className="text-gray-400">→</span>
                  <span className="break-words">{drop}</span>
                </span>
              }
            />
            {job.deliveryAddress && <DetailRow label="Delivery address" value={job.deliveryAddress} />}
            <DetailRow label="Ready time" value={formatDateTime(job.readyTime)} />
            <DetailRow label="Deadline" value={formatDateTime(job.deadline)} />
            <DetailRow
              label="Requirements"
              value={
                <span className="flex flex-wrap gap-2">
                  {job.requiresReefer ? (
                    <Badge variant="teal">Reefer</Badge>
                  ) : (
                    <Badge variant="outline">No reefer</Badge>
                  )}
                  {job.requiresHazmat ? (
                    <Badge variant="outline">Hazmat{job.hazmatClass ? ` — ${job.hazmatClass}` : ''}</Badge>
                  ) : (
                    <Badge variant="outline">No hazmat</Badge>
                  )}
                </span>
              }
            />
            <DetailRow
              label="Price"
              value={
                price != null ? (
                  <span>
                    <span className="font-mono font-bold text-brand-teal">
                      {formatCurrencyAED(price)}
                    </span>
                    {priceLabel && <span className="ml-2 text-xs text-gray-500">{priceLabel}</span>}
                  </span>
                ) : (
                  <span className="text-gray-400">Open to bidding</span>
                )
              }
            />
            <DetailRow label="Shipper" value={job.shipperName ?? job.shipperId} />
            <DetailRow label="Carrier" value={job.carrierName ?? job.carrierId ?? '—'} />
            {job.notes && <DetailRow label="Notes" value={job.notes} />}
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <BidList jobId={job.id} />
          {role === 'CARRIER' && openToBids && <SubmitBid jobId={job.id} />}
        </div>
        <div className="space-y-6">
          <Chat jobId={job.id} />
          {role === 'SHIPPER' && job.status === 'AWARDED' && job.agreedPriceAED != null && (
            <EscrowPayment jobId={job.id} amountAED={job.agreedPriceAED} />
          )}
        </div>
      </div>
    </div>
  );
};
