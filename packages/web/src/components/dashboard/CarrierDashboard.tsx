import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Clock,
  Inbox,
  PackageOpen,
  RefreshCw,
  Truck,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatContainerSize, formatCurrencyAED, pickupLabel, dropLabel } from '@/lib/utils';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useToast } from '@/hooks/useToast';
import { fetchApi } from '@/lib/api';
import type { JobStatus } from '@/types';

interface CarrierStats {
  totalJobsPosted: number;
  totalBidsPlaced: number;
  totalSpentAED: number;
  totalEarnedAED: number;
  savingsPercentage: number;
  onTimeDeliveryRate: number;
  activeJobs: number;
  pendingBids: number;
}

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

const OPEN_JOB_STATUSES: JobStatus[] = ['OPEN', 'BIDDING'];
const ACTIVE_JOB_STATUSES: JobStatus[] = ['AWARDED', 'IN_TRANSIT'];

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
    <div className="h-20 bg-gray-200 rounded-xl" />
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

export const CarrierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, loading, error, refresh } = useJobs();
  const { addToast } = useToast();

  const [fleetAvailable, setFleetAvailable] = useState(true);
  const [stats, setStats] = useState<CarrierStats | null>(null);

  const availableLoads = useMemo(
    () => jobs.filter((job) => OPEN_JOB_STATUSES.includes(job.status)),
    [jobs]
  );
  const myActiveLoads = useMemo(
    () => jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status) && job.carrierName),
    [jobs]
  );
  const activeJobCount = useMemo(
    () => jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length,
    [jobs]
  );

  useEffect(() => {
    if (!user) return;
    fetchApi(`/users/${user.id}/stats`)
      .then((data) => setStats(data as CarrierStats))
      .catch((err: unknown) =>
        addToast({
          type: 'error',
          title: 'Failed to load stats',
          description: err instanceof Error ? err.message : 'Could not fetch account statistics'
        })
      );
  }, [user, addToast]);

  if (loading && jobs.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Carrier Console</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fleet overview · {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="secondary" className="flex items-center gap-2">
            <PackageOpen className="w-4 h-4" />
            Browse Loads
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

      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
                fleetAvailable ? 'bg-brand-teal-light text-brand-teal' : 'bg-gray-100 text-gray-400'
              )}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900">
                Fleet {fleetAvailable ? 'Available' : 'Off Duty'}
              </p>
              <p className="text-xs text-gray-500">
                42 trucks online ·{' '}
                <span className={fleetAvailable ? 'font-semibold text-brand-teal' : 'text-gray-400'}>
                  {fleetAvailable ? 'Dispatching active' : 'Not accepting loads'}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={fleetAvailable}
            aria-label="Toggle fleet availability"
            onClick={() => setFleetAvailable((prev) => !prev)}
            className={cn(
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
              fleetAvailable ? 'bg-brand-teal focus:ring-brand-teal' : 'bg-gray-300 focus:ring-gray-400'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                fleetAvailable ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Loads"
          value={String(availableLoads.length)}
          icon={PackageOpen}
          iconClassName="bg-brand-orange-light text-brand-orange"
        />
        <StatCard
          label="My Active Loads"
          value={String(activeJobCount)}
          icon={Truck}
          iconClassName="bg-navy-100 text-navy-800"
        />
        <StatCard
          label="Earnings This Month"
          value={stats ? formatCurrencyAED(stats.totalEarnedAED) : '—'}
          icon={Wallet}
          iconClassName="bg-brand-teal-light text-brand-teal"
        />
        <StatCard
          label="On-Time Rate"
          value={stats ? `${stats.onTimeDeliveryRate}%` : '—'}
          icon={Clock}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Available Loads</CardTitle>
              <CardDescription>Open jobs ready for your fleet</CardDescription>
            </div>
            <PackageOpen className="w-5 h-5 text-brand-orange" />
          </CardHeader>
          <CardContent className="p-0">
            {availableLoads.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No loads available"
                subtitle="New container jobs around Jebel Ali will appear here as they are posted."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {availableLoads.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="group flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-gray-50/80"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-navy-900 group-hover:text-brand-orange">
                        {job.jobCode}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatContainerSize(job.containerSize)} · {pickupLabel(job)} → {dropLabel(job)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-navy-900">
                          {job.maxBudgetAED !== undefined ? formatCurrencyAED(job.maxBudgetAED) : '—'}
                        </p>
                        <p className="text-[11px] text-gray-500">{job.bidsCount ?? 0} bids</p>
                      </div>
                      <Badge variant={jobStatusVariant[job.status]}>{job.status.replace('_', ' ')}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-brand-orange-hover">
              View all available loads
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Awarded Jobs</CardTitle>
              <CardDescription>Contracts assigned to your fleet</CardDescription>
            </div>
            <Truck className="w-5 h-5 text-brand-teal" />
          </CardHeader>
          <CardContent className="p-0">
            {myActiveLoads.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No awarded jobs"
                subtitle="Jobs you win will appear here with agreed pricing and tracking."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {myActiveLoads.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-navy-900">{job.jobCode}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatContainerSize(job.containerSize)} · {pickupLabel(job)} → {dropLabel(job)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-navy-900">
                        {job.agreedPriceAED !== undefined ? formatCurrencyAED(job.agreedPriceAED) : '—'}
                      </span>
                      <Badge variant={jobStatusVariant[job.status]}>{job.status.replace('_', ' ')}</Badge>
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
    </div>
  );
};
