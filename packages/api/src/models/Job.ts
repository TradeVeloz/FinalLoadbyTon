import { JobRecord } from '../types';
import { generateJobCode, uid } from '../utils/helpers';

export type JobEntity = JobRecord;

export function createJobEntity(
  data: Omit<JobRecord, 'id' | 'jobCode' | 'status' | 'bidsCount' | 'createdAt' | 'updatedAt'>
): JobEntity {
  const now = new Date().toISOString();
  return {
    ...data,
    id: uid('job'),
    jobCode: generateJobCode(),
    status: 'BIDDING',
    bidsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function isJobOpenToBids(job: JobEntity): boolean {
  return job.status === 'OPEN' || job.status === 'BIDDING';
}
