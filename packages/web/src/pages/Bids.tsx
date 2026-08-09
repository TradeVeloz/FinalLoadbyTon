import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, PackageSearch, Gavel, ArrowUpRight } from 'lucide-react';
import { BidList } from '@/components/bids/BidList';
import { SubmitBid } from '@/components/bids/SubmitBid';
import { useJobs } from '@/hooks/useJobs';
import { useBids } from '@/hooks/useBids';
import { useAuth } from '@/hooks/useAuth';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pickupLabel, dropLabel, formatCurrencyAED } from '@/lib/utils';
import { Job, JobStatus, Bid } from '@/types';

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

const MyBids: React.FC = () => {
  const { listMyBids } = useBids();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyBids()
      .then(setBids)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load your bids'))
      .finally(() => setLoading(false));
  }, [listMyBids]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Bids</h1>
          <p className="text-sm text-gray-500 mt-1">Every offer your fleet has placed across the marketplace.</p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center space-x-2 text-sm font-medium text-brand-orange hover:underline"
        >
          <PackageSearch className="w-4 h-4" />
          <span>Browse jobs</span>
        </Link>
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && bids.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
          <p className="mt-4 font-semibold text-navy-900">No bids placed yet</p>
          <p className="mt-1 text-sm text-gray-500">Place a bid on an open load and it will show up here.</p>
          <Link to="/jobs">
            <button className="mt-4 text-sm font-medium text-brand-orange hover:underline">Go to Loads →</button>
          </Link>
        </div>
      )}

      {!loading && !error && bids.length > 0 && (
        <div className="space-y-3">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">Job {bid.jobId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bid.truckType} · {bid.etaMinutes} min ETA
                    {bid.driverName ? ` · ${bid.driverName}` : ''}
                  </p>
                  {bid.notes && <p className="text-xs text-gray-500 mt-1 truncate">{bid.notes}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-brand-teal">{formatCurrencyAED(bid.amountAED)}</span>
                  <Badge variant={bid.status === 'ACCEPTED' ? 'awarded' : bid.status === 'REJECTED' ? 'cancelled' : 'bidding'}>
                    {bid.status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                  </Badge>
                  <Link
                    to={`/jobs/${bid.jobId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:text-teal-700"
                  >
                    View job
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const Bids: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { role } = useAuth();
  const { getJob } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(Boolean(jobId));

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      setJob(await getJob(jobId));
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId, getJob]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!jobId) {
    return <MyBids />;
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-72 bg-gray-200 rounded" />
        <div className="h-64 w-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Gavel className="w-8 h-8 mx-auto text-gray-300" />
        <p className="mt-3 font-semibold text-navy-900">Job not found</p>
        <p className="mt-1 text-sm text-gray-500">This job may have been removed or the id is incorrect.</p>
        <Link to="/jobs">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to loads
          </Button>
        </Link>
      </div>
    );
  }

  const openToBids = job.status === 'OPEN' || job.status === 'BIDDING';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to={`/jobs/${job.id}`} className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-navy-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to load</span>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900 tracking-tight">
            Bids for <span className="font-mono">{job.jobCode}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pickupLabel(job)} → {dropLabel(job)} · {job.containerSize.replace(/_/g, ' ')}
          </p>
        </div>
        <Badge variant={statusVariantMap[job.status]}>
          {job.status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
        </Badge>
      </div>

      <BidList jobId={jobId} onJobChanged={load} />
      {role === 'CARRIER' && openToBids && <SubmitBid jobId={jobId} />}
    </div>
  );
};
