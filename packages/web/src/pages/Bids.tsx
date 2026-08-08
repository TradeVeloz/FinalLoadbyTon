import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PackageSearch, Gavel } from 'lucide-react';
import { BidList } from '@/components/bids/BidList';
import { SubmitBid } from '@/components/bids/SubmitBid';
import { JobDetail } from '@/components/jobs/JobDetail';
import { useJobs } from '@/hooks/useJobs';
import { Badge } from '@/components/ui/badge';
import { pickupLabel, dropLabel } from '@/lib/utils';

export const Bids: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs } = useJobs();
  const [job, setJob] = useState(() => jobs.find((j) => j.id === jobId));

  useEffect(() => {
    if (jobId) {
      const match = jobs.find((j) => j.id === jobId);
      setJob(match);
    }
  }, [jobs, jobId]);

  if (!jobId) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Bids</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and compare carrier offers.</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 text-sm font-medium text-brand-orange hover:underline"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Browse jobs</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
          <p className="mt-4 font-semibold text-navy-900">No job selected</p>
          <p className="mt-1 text-sm text-gray-500">Pick a job from the list to view or submit bids.</p>
          <Link to="/jobs">
            <button className="mt-4 text-sm font-medium text-brand-orange hover:underline">Go to Jobs →</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-navy-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {job ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-navy-900 tracking-tight">
              Bids for <span className="font-mono">{job.jobCode}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pickupLabel(job)} → {dropLabel(job)} · {job.containerSize.replace(/_/g, ' ')}
            </p>
          </div>
          <Badge variant={job.status.toLowerCase() as never}>
            {job.status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
          </Badge>
        </div>
      ) : (
        <h1 className="text-xl font-extrabold text-navy-900 tracking-tight">Bids</h1>
      )}

      <BidList jobId={jobId} />
      <SubmitBid jobId={jobId} />
      <JobDetail />
    </div>
  );
};
