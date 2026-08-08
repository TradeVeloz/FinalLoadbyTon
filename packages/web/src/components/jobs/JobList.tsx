import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, PackageOpen, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from './JobCard';
import {
  JobStatus,
} from '@/types';
import {
  pickupLabel,
  dropLabel,
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

interface Filters {
  status: string;
  search: string;
}

export const JobList: React.FC = () => {
  const { role } = useAuth();
  const { jobs, loading, error, refresh } = useJobs();
  const [filters, setFilters] = useState<Filters>({ status: '', search: '' });

  const applyFilters = useCallback(
    (next: Filters) => {
      setFilters(next);
      void refresh({
        status: next.status || undefined,
      });
    },
    [refresh],
  );

  const filteredJobs = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter((job) => {
      const route = `${pickupLabel(job)} ${dropLabel(job)}`.toLowerCase();
      return route.includes(term);
    });
  }, [jobs, filters.search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loads &amp; Bids</h1>
          <p className="text-sm text-gray-500">
            Find container haulage loads across the UAE and place bids.
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
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => applyFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All statuses' },
              ...JOB_STATUSES.map((s) => ({ value: s, label: jobStatusLabelMap[s] })),
            ]}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Search locations
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Anywhere in the UAE — port, city or district"
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
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
              applyFilters({ status: '', search: '' })
            }
          >
            Clear filters
          </Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center space-y-3">
          <Search className="w-10 h-10 mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-navy-800">No loads match "{filters.search}"</p>
          <p className="text-xs text-gray-500">
            Try a different port, city or district across the UAE.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
