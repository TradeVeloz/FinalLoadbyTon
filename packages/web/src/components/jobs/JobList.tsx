import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, PackageOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from './JobCard';
import {
  DeliveryArea,
  JobStatus,
  Terminal,
} from '@/types';
import {
  formatDeliveryArea,
  formatTerminalName,
} from '@/lib/utils';

const JOB_STATUSES: JobStatus[] = [
  'DRAFT',
  'OPEN',
  'BIDDING',
  'AWARDED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

const jobStatusLabelMap: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  BIDDING: 'Bidding',
  AWARDED: 'Awarded',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const TERMINALS: Terminal[] = [
  'JEBEL_ALI_T1',
  'JEBEL_ALI_T2',
  'JEBEL_ALI_T3',
  'JEBEL_ALI_T4',
  'KHALIFA',
  'SHARJAH',
];

const AREAS: DeliveryArea[] = [
  'JAFZA_NORTH',
  'JAFZA_SOUTH',
  'AL_QUOZ',
  'DIP',
  'NIP',
  'DAFZA',
  'DIC',
  'DUBAI_SOUTH',
  'OTHER',
];

interface Filters {
  status: string;
  terminal: string;
  area: string;
}

export const JobList: React.FC = () => {
  const { role } = useAuth();
  const { jobs, loading, error, refresh } = useJobs();
  const [filters, setFilters] = useState<Filters>({ status: '', terminal: '', area: '' });

  const applyFilters = useCallback(
    (next: Filters) => {
      setFilters(next);
      void refresh({
        status: next.status || undefined,
        terminal: next.terminal || undefined,
        area: next.area || undefined,
      });
    },
    [refresh],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loads &amp; Bids</h1>
          <p className="text-sm text-gray-500">
            Find container haulage loads around Jebel Ali and place bids.
          </p>
        </div>
        {role === 'SHIPPER' && (
          <Link to="/jobs/new" className="inline-flex">
            <Button variant="primary">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Post New Load
            </Button>
          </Link>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => applyFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All statuses' },
              ...JOB_STATUSES.map((s) => ({ value: s, label: jobStatusLabelMap[s] })),
            ]}
          />
          <Select
            label="Pickup terminal"
            value={filters.terminal}
            onChange={(e) => applyFilters({ ...filters, terminal: e.target.value })}
            options={[
              { value: '', label: 'All terminals' },
              ...TERMINALS.map((t) => ({ value: t, label: formatTerminalName(t) })),
            ]}
          />
          <Select
            label="Delivery area"
            value={filters.area}
            onChange={(e) => applyFilters({ ...filters, area: e.target.value })}
            options={[
              { value: '', label: 'All areas' },
              ...AREAS.map((a) => ({ value: a, label: formatDeliveryArea(a) })),
            ]}
          />
        </CardContent>
      </Card>

      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">Failed to load jobs</p>
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center space-y-3">
          <PackageOpen className="w-10 h-10 mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-navy-800">No loads match your filters</p>
          <p className="text-xs text-gray-500">
            Try clearing a filter or check back later for new postings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyFilters({ status: '', terminal: '', area: '' })
            }
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
