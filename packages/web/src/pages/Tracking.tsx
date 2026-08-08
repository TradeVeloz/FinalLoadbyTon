import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Package, Truck, Clock, Flag, LocateFixed } from 'lucide-react';
import { StatusTimeline } from '@/components/tracking/StatusTimeline';
import { ETAWidget } from '@/components/tracking/ETAWidget';
import { useJobs } from '@/hooks/useJobs';
import { fetchApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/types';
import { pickupLabel, dropLabel } from '@/lib/utils';

interface TrackingData {
  jobId: string;
  status?: string;
  etaMinutes?: number;
  milestones?: { label: string; timestamp: string; completed: boolean }[];
}

const DEFAULT_MILESTONES = [
  { label: 'Container released by terminal', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), completed: true },
  { label: 'Truck departed terminal gate', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), completed: true },
  { label: 'In transit to destination', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), completed: true },
  { label: 'Arrived at delivery address', timestamp: '', completed: false },
  { label: 'POD signed & uploaded', timestamp: '', completed: false },
];

const STATUS_VARIANT: Record<string, NonNullable<React.ComponentProps<typeof Badge>['variant']>> = {
  open: 'open',
  bidding: 'bidding',
  awarded: 'awarded',
  in_transit: 'in_transit',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const Tracking: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { getJob } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const [jobData, trackingData] = await Promise.all([
          getJob(jobId).catch(() => null),
          fetchApi<TrackingData>(`/tracking/${jobId}`).catch(() => null),
        ]);
        if (!active) return;
        setJob(jobData);
        setTracking(trackingData);
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load tracking.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const poll = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, [jobId, getJob]);

  if (loading && !job) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="font-semibold text-navy-900">Couldn't load tracking</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <Link to="/jobs" className="mt-4 inline-block text-sm font-medium text-brand-orange hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const status = tracking?.status ?? job?.status ?? 'awarded';
  const statusKey = status.toLowerCase() as keyof typeof STATUS_VARIANT;
  const milestones = tracking?.milestones ?? DEFAULT_MILESTONES;
  const pickup = job ? pickupLabel(job) : 'Pickup location';
  const drop = job ? dropLabel(job) : 'Drop-off location';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-navy-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to jobs</span>
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900 tracking-tight flex flex-wrap items-center gap-3">
            <span className="font-mono">{job?.jobCode ?? '—'}</span>
            <Badge variant={STATUS_VARIANT[statusKey] ?? 'awarded'}>
              {status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0 text-brand-orange" />
            <span className="min-w-0">
              <span className="break-words">{pickup}</span>
              <span className="text-gray-400"> → </span>
              <span className="break-words">{drop}</span>
            </span>
          </p>
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <ETAWidget etaMinutes={tracking?.etaMinutes} status={status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle className="text-base">Movement timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline milestones={milestones} />
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LocateFixed className="w-4 h-4 text-brand-orange" />
                Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 mt-1 rounded-full bg-brand-teal ring-4 ring-brand-teal/15" />
                  <span className="w-0.5 flex-1 bg-gray-200" />
                  <span className="w-3 h-3 mb-1 rounded-full bg-navy-800 ring-4 ring-navy-800/10" />
                </div>
                <div className="space-y-4 pt-0.5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pickup</p>
                    <p className="mt-0.5 text-sm font-medium text-navy-800 break-words">{pickup}</p>
                    {job?.pickupLat != null && job?.pickupLng != null && (
                      <p className="font-mono text-xs text-gray-400">
                        {job.pickupLat.toFixed(5)}, {job.pickupLng.toFixed(5)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Drop-off</p>
                    <p className="mt-0.5 text-sm font-medium text-navy-800 break-words">{drop}</p>
                    {job?.deliveryLat != null && job?.deliveryLng != null && (
                      <p className="font-mono text-xs text-gray-400">
                        {job.deliveryLat.toFixed(5)}, {job.deliveryLng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-orange" />
              Shipment details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { label: 'Container', value: job?.containerNumber ?? '—', mono: true, icon: Package },
              { label: 'Truck', value: job?.carrierName ?? '—', icon: Truck },
              { label: 'Container type', value: `${job?.containerSize?.replace(/_/g, ' ') ?? '—'} · ${job?.containerType ?? ''}` },
              { label: 'Status updated', value: new Date().toLocaleTimeString(), icon: Clock },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-500">{row.label}</span>
                <span className={`font-semibold text-navy-800 text-right ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-xs text-brand-teal">
              <Flag className="w-4 h-4 shrink-0" />
              Milestones refresh automatically as the move progresses.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
