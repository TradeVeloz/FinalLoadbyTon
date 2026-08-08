import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Satellite, Clock } from 'lucide-react';
import { TrackingMap } from '@/components/tracking/TrackingMap';
import { StatusTimeline } from '@/components/tracking/StatusTimeline';
import { ETAWidget } from '@/components/tracking/ETAWidget';
import { useJobs } from '@/hooks/useJobs';
import { fetchApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/types';

interface TrackingData {
  jobId: string;
  status?: string;
  currentLocation?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  etaMinutes?: number;
  milestones?: { label: string; timestamp: string; completed: boolean }[];
}

const DEFAULT_ROUTE = [
  { lat: 25.01, lng: 55.06 },
  { lat: 25.02, lng: 55.08 },
  { lat: 25.03, lng: 55.1 },
  { lat: 25.02, lng: 55.12 },
  { lat: 25.0, lng: 55.14 },
];

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
  const points = tracking?.route ?? DEFAULT_ROUTE;
  const currentLocation = tracking?.currentLocation ?? points[Math.floor(points.length / 2)];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-navy-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to jobs</span>
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <span className="font-mono">{job?.jobCode ?? '—'}</span>
            <Badge variant={STATUS_VARIANT[statusKey] ?? 'awarded'}>
              {status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-orange" />
            {job?.pickupTerminal.replace(/_/g, ' ')} → {job?.deliveryAddress || job?.deliveryArea.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="w-56">
          <ETAWidget etaMinutes={tracking?.etaMinutes} status={status} />
        </div>
      </div>

      <TrackingMap currentLocation={currentLocation} points={points} containerNumber={job?.containerNumber} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-premium">
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
              <Satellite className="w-4 h-4 text-brand-orange" />
              Live telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { label: 'Container', value: job?.containerNumber ?? '—', mono: true },
              { label: 'Truck', value: job?.carrierName ?? '—' },
              { label: 'Container type', value: `${job?.containerSize?.replace(/_/g, ' ') ?? '—'} · ${job?.containerType ?? ''}` },
              { label: 'Last update', value: new Date().toLocaleTimeString() },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-500">{row.label}</span>
                <span className={`font-semibold text-navy-800 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-xs text-brand-teal">
              <Clock className="w-4 h-4 shrink-0" />
              GPS refreshed every 30 seconds.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
