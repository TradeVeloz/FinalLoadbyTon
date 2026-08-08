import { RatingRecord } from '../types';

const ratings: RatingRecord[] = [
  {
    id: 'rat-801',
    jobId: 'job-102',
    raterId: 'usr-shipper-1',
    rateeId: 'usr-carrier-1',
    raterName: 'Al-Majid Global Freight',
    score: 4.8,
    comment: 'On-time pickup, excellent communication throughout the move. Reefer temp logs matched the set point.',
    category: 'PROFESSIONALISM',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rat-802',
    jobId: 'job-101',
    raterId: 'usr-carrier-1',
    rateeId: 'usr-shipper-1',
    raterName: 'Emirates Overland Haulage',
    score: 4.9,
    comment: 'Gate pass ready ahead of time, clear delivery instructions.',
    category: 'COMMUNICATION',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export function listRatingsForUser(userId: string): RatingRecord[] {
  return ratings
    .filter((r) => r.rateeId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRatingsByRater(userId: string): RatingRecord[] {
  return ratings
    .filter((r) => r.raterId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRatingForJob(jobId: string): RatingRecord | undefined {
  return ratings.find((r) => r.jobId === jobId);
}

export function createRating(
  data: { jobId: string; raterId: string; rateeId: string; raterName?: string; score: number; comment?: string; category: string }
): RatingRecord | undefined {
  if (getRatingForJob(data.jobId)) {
    throw Object.assign(new Error('This job has already been rated'), { status: 409 });
  }
  const rating: RatingRecord = {
    id: `rat-${Date.now()}`,
    jobId: data.jobId,
    raterId: data.raterId,
    rateeId: data.rateeId,
    raterName: data.raterName,
    score: Math.min(5, Math.max(1, data.score)),
    comment: data.comment,
    category: data.category,
    createdAt: new Date().toISOString(),
  };
  ratings.push(rating);
  return rating;
}
