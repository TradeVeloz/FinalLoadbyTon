import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Container,
  Gavel,
  Inbox,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Star,
  Truck,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatContainerSize, formatCurrencyAED, pickupLabel, dropLabel } from '@/lib/utils';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useBids } from '@/hooks/useBids';
import { useJobs } from '@/hooks/useJobs';
import { useToast } from '@/hooks/useToast';
import { fetchApi } from '@/lib/api';
import type { Bid, JobStatus, Message } from '@/types';

interface ShipperStats {
  totalJobsPosted: number;
  totalBidsPlaced: number;
  totalSpentAED: number;
  totalEarnedAED: number;
  savingsPercentage: number;
  onTimeDeliveryRate: number;
  activeJobs: number;
  pendingBids: number;
}

const ACTIVE_JOB_STATUSES: JobStatus[] = ['OPEN', 'BIDDING', 'AWARDED', 'IN_TRANSIT'];

const jobStatusVariant: Record<JobStatus, BadgeProps['variant']> = {
  DRAFT: 'outline',
  OPEN: 'open',
  BIDDING: 'bidding',
  AWARDED: 'awarded',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const bidStatusVariant: Record<Bid['status'], BadgeProps['variant']> = {
  PENDING: 'bidding',
  ACCEPTED: 'awarded',
  REJECTED: 'cancelled',
  EXPIRED: 'outline'
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, iconClassName }) => (
  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center space-x-4">
    <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', iconClassName)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-xl font-extrabold text-navy-900 mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: LucideIcon; title: string; subtitle: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-navy-800">{title}</p>
    <p className="text-xs text-gray-500 mt-1 max-w-xs">{subtitle}</p>
  </div>
);

const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-9 bg-gray-200 rounded-lg w-72" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

export const ShipperDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, loading, error, refresh } = useJobs();
  const { listBids } = useBids();
  const { addToast } = useToast();

  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const activeJobs = useMemo(() => jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)), [jobs]);
  const bidsReceived = useMemo(() => activeJobs.reduce((sum, job) => sum + (job.bidsCount ?? 0), 0), [activeJobs]);
  const inTransitJobs = useMemo(() => jobs.filter((job) => job.status === 'IN_TRANSIT'), [jobs]);
  const inProgressJobs = useMemo(
    () => jobs.filter((job) => job.status === 'AWARDED' || job.status === 'IN_TRANSIT'),
    [jobs]
  );
  const biddingJob = useMemo(() => jobs.find((job) => job.status === 'BIDDING'), [jobs]);
  const firstInTransitJob = inTransitJobs[0];

  useEffect(() => {
    if (!user) return;
    fetchApi(`/users/${user.id}/stats`)
      .then((data) => setStats(data as ShipperStats))
      .catch((err: unknown) =>
        addToast({
          type: 'error',
          title: 'Failed to load stats',
          description: err instanceof Error ? err.message : 'Could not fetch account statistics'
        })
      );
  }, [user, addToast]);

  useEffect(() => {
    if (!biddingJob) {
      setRecentBids([]);
      return;
    }
    setBidsLoading(true);
    listBids(biddingJob.id)
      .then(setRecentBids)
      .catch((err: unknown) =>
        addToast({
          type: 'error',
          title: 'Failed to load bids',
          description: err instanceof Error ? err.message : 'Could not fetch bids for this job'
        })
      )
      .finally(() => setBidsLoading(false));
  }, [biddingJob, listBids, addToast]);

  useEffect(() => {
    if (!firstInTransitJob) {
      setRecentMessages([]);
      return;
    }
    setMessagesLoading(true);
    fetchApi(`/messages/job/${firstInTransitJob.id}`)
      .then((data) => setRecentMessages((data as Message[]).slice(-3)))
      .catch((err: unknown) =>
        addToast({
          type: 'error',
          title: 'Failed to load messages',
          description: err instanceof Error ? err.message : 'Could not fetch job messages'
        })
      )
      .finally(() => setMessagesLoading(false));
  }, [firstInTransitJob, addToast]);

  const spendYTD = stats?.totalSpentAED ?? 168400;

  if (loading && jobs.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Shipper overview · {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/jobs/new">
          <Button variant="primary" className="flex items-center gap-2 shadow-glow-orange">
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => refresh()} className="inline-flex items-center gap-1.5 font-semibold hover:text-red-800">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Jobs"
          value={String(activeJobs.length)}
          icon={Container}
          iconClassName="bg-brand-orange-light text-brand-orange"
        />
        <StatCard
          label="Bids Received"
          value={String(bidsReceived)}
          icon={Gavel}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="In Transit"
          value={String(inTransitJobs.length)}
          icon={Truck}
          iconClassName="bg-brand-teal-light text-brand-teal"
        />
        <StatCard
          label="Spend YTD"
          value={formatCurrencyAED(spendYTD)}
          icon={Wallet}
          iconClassName="bg-navy-100 text-navy-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Bids Received</CardTitle>
              <CardDescription>
                {biddingJob ? `Live bids on ${biddingJob.jobCode}` : 'No jobs currently in bidding'}
              </CardDescription>
            </div>
            <Gavel className="w-5 h-5 text-brand-orange" />
          </CardHeader>
          <CardContent className="p-0">
            {!biddingJob ? (
              <EmptyState
                icon={Inbox}
                title="No active bidding"
                subtitle="Once a job enters the bidding stage, incoming carrier quotes will appear here."
              />
            ) : bidsLoading ? (
              <div className="h-40 animate-pulse bg-gray-100 rounded-b-xl" />
            ) : recentBids.length === 0 ? (
              <EmptyState
                icon={Gavel}
                title="No bids yet"
                subtitle="Your job is live — carriers are reviewing it and will place bids shortly."
              />
            ) : (
              <Table className="border-0 rounded-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-navy-900">{bid.carrierName}</p>
                          <p className="text-xs text-gray-500">
                            {bid.completedJobs} jobs · {bid.truckType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {bid.carrierRating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-navy-900">
                          {formatCurrencyAED(bid.amountAED)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{bid.etaMinutes} min</TableCell>
                      <TableCell>
                        <Badge variant={bidStatusVariant[bid.status]}>{bid.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/jobs/${bid.jobId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-brand-orange-hover"
                        >
                          Review
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>In-Progress Deliveries</CardTitle>
              <CardDescription>{inProgressJobs.length} container moves currently active</CardDescription>
            </div>
            <Truck className="w-5 h-5 text-brand-teal" />
          </CardHeader>
          <CardContent className="p-0">
            {inProgressJobs.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Nothing in transit yet"
                subtitle="Awarded and in-transit jobs will show up here with live tracking access."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {inProgressJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-navy-900">{job.jobCode}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {pickupLabel(job)} → {dropLabel(job)} · {formatContainerSize(job.containerSize)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:block text-xs text-gray-600 font-medium">
                        {job.carrierName ?? 'Carrier assigned'}
                      </span>
                      <Badge variant={jobStatusVariant[job.status]}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Link
                        to={`/tracking/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:text-teal-700"
                      >
                        Track
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              {firstInTransitJob
                ? `Latest correspondence on ${firstInTransitJob.jobCode}`
                : 'Job thread updates will appear here'}
            </CardDescription>
          </div>
          <MessageSquare className="w-5 h-5 text-navy-500" />
        </CardHeader>
        <CardContent className="p-0">
          {!firstInTransitJob ? (
            <EmptyState
              icon={MessageSquare}
              title="No active job threads"
              subtitle="Messages from carriers on in-transit jobs will be listed here."
            />
          ) : messagesLoading ? (
            <div className="h-32 animate-pulse bg-gray-100 rounded-b-xl" />
          ) : recentMessages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages yet" subtitle="Start a conversation with your carrier." />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentMessages.map((message) => (
                <div key={message.id} className="px-6 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-navy-800">{message.senderName}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(message.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
