import React from 'react';
import { JobList } from '@/components/jobs/JobList';
import { JobDetail } from '@/components/jobs/JobDetail';
import { PostJob } from '@/components/jobs/PostJob';

interface JobsProps {
  postMode?: boolean;
  detailMode?: boolean;
}

export const Jobs: React.FC<JobsProps> = ({ postMode = false, detailMode = false }) => {
  if (postMode) {
    return <PostJob />;
  }
  if (detailMode) {
    return <JobDetail />;
  }
  return <JobList />;
};
