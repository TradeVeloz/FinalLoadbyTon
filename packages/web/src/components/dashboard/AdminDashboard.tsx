import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Container,
  Landmark,
  Percent,
  RefreshCw,
  Route,
  TrendingUp,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrencyAED } from '@/lib/utils';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchApi } from '@/lib/api';

interface AdminMetrics {
  totalVolumeTEU: number;
  activeContainersToday: number;
  averageDrayageFeeAED: number;
  marketplaceTakeRate: string;
  escrowBalanceAED: number;
  disputeRate: string;
}

interface PopularLane {
  origin: string;
  destination: string;
  avgPriceAED: number;
  volume24h: number;
}

interface DashboardResponse {
  metrics: AdminMetrics;
  jobsByStatus: Record<string, number>;
  popularLanes: PopularLane[];
}

interface LaneBenchmark {
  origin: string;
  destination: string;
  avgPriceAED: number;
  minPriceAED: number;
  maxPriceAED: number;
  trips30d: number;
  avgOnTime: string;
}

interface LanesResponse {
  lanes: LaneBenchmark[];
}

const jobStatusVariant: Record<string, BadgeProps['variant']> = {
  DRAFT: 'outline',
  OPEN: 'open',
  BIDDING: 'bidding',
  AWARDED: 'awarded',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, iconClassName }) => (
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

export const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [lanes, setLanes] = useState<LaneBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchApi('/analytics/dashboard'),
      fetchApi('/analytics/lanes')
    ])
      .then(([dashData, laneData]) => {
        setDashboard(dashData as DashboardResponse);
        setLanes((laneData as LanesResponse).lanes);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load marketplace analytics')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-9 bg-gray-200 rounded-lg w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const metrics = dashboard?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Marketplace Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Platform health, lanes and marketplace performance</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-brand-orange"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Total TEU"
            value={String(metrics.totalVolumeTEU)}
            icon={Container}
            iconClassName="bg-brand-orange-light text-brand-orange"
          />
          <MetricCard
            label="Active Containers Today"
            value={String(metrics.activeContainersToday)}
            icon={Boxes}
            iconClassName="bg-navy-100 text-navy-800"
          />
          <MetricCard
            label="Avg Drayage Fee"
            value={formatCurrencyAED(metrics.averageDrayageFeeAED)}
            icon={Wallet}
            iconClassName="bg-brand-teal-light text-brand-teal"
          />
          <MetricCard
            label="Take Rate"
            value={metrics.marketplaceTakeRate}
            icon={Percent}
            iconClassName="bg-amber-50 text-amber-600"
          />
          <MetricCard
            label="Escrow Balance"
            value={formatCurrencyAED(metrics.escrowBalanceAED)}
            icon={Landmark}
            iconClassName="bg-gray-100 text-gray-700"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Popular Lanes</CardTitle>
              <CardDescription>Highest-volume routes in the last 24 hours</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-orange" />
          </CardHeader>
          <CardContent className="p-0">
            {dashboard?.popularLanes.length ? (
              <Table className="border-0 rounded-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Volume 24h</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.popularLanes.map((lane) => (
                    <TableRow key={`${lane.origin}-${lane.destination}`}>
                      <TableCell className="font-semibold text-navy-900">{lane.origin}</TableCell>
                      <TableCell>{lane.destination}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-navy-900">
                          {formatCurrencyAED(lane.avgPriceAED)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-brand-teal">
                          {lane.volume24h}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">No lane data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Jobs by Status</CardTitle>
              <CardDescription>Live distribution of marketplace job statuses</CardDescription>
            </div>
            <Container className="w-5 h-5 text-brand-teal" />
          </CardHeader>
          <CardContent>
            {dashboard && Object.keys(dashboard.jobsByStatus).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(dashboard.jobsByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/50"
                  >
                    <Badge variant={jobStatusVariant[status] ?? 'outline'}>
                      {status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-mono text-sm font-bold text-navy-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">No job status data available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Lane Pricing Benchmarks</CardTitle>
            <CardDescription>30-day pricing ranges and on-time performance by route</CardDescription>
          </div>
          <Route className="w-5 h-5 text-navy-500" />
        </CardHeader>
        <CardContent className="p-0">
          {lanes.length ? (
            <Table className="border-0 rounded-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Trips 30d</TableHead>
                  <TableHead>On-Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lanes.map((lane) => (
                  <TableRow key={`${lane.origin}-${lane.destination}`}>
                    <TableCell className="font-semibold text-navy-900">{lane.origin}</TableCell>
                    <TableCell>{lane.destination}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-gray-700">
                        {formatCurrencyAED(lane.minPriceAED)} – {formatCurrencyAED(lane.maxPriceAED)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-bold text-navy-900">
                        {formatCurrencyAED(lane.avgPriceAED)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold text-brand-teal">{lane.trips30d}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="teal">{lane.avgOnTime}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">No benchmark data available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
