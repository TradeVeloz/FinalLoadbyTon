import { BidRecord, BidStatus } from '../types';
import { getJob, trackBid, awardJob } from './jobService';

const bids: BidRecord[] = [
  {
    id: 'bid-301',
    jobId: 'job-101',
    carrierId: 'usr-carrier-1',
    carrierName: 'Emirates Overland Haulage Co.',
    carrierRating: 4.85,
    completedJobs: 320,
    amountAED: 1180,
    etaMinutes: 45,
    truckType: 'Heavy Flatbed Tri-Axle (40ft)',
    driverName: 'Mohammed Al-Rashid',
    notes: 'Trailer pre-positioned in JAFZA North. Ready for instant pickup upon customs release.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'bid-302',
    jobId: 'job-101',
    carrierId: 'usr-carrier-2',
    carrierName: 'Falcon Container Express LLC',
    carrierRating: 4.7,
    completedJobs: 184,
    amountAED: 1220,
    etaMinutes: 30,
    truckType: 'Container Chassis Skeletal',
    driverName: 'Tariq Saeed',
    notes: 'Direct terminal access permit active.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'bid-303',
    jobId: 'job-101',
    carrierId: 'usr-carrier-3',
    carrierName: 'Gulf Heavy Transport Fleet',
    carrierRating: 4.9,
    completedJobs: 412,
    amountAED: 1250,
    etaMinutes: 20,
    truckType: 'Multi-Axle Air-Suspension',
    driverName: 'Rashid Khan',
    notes: 'Specialized low-vibration trailer suitable for delicate cargo.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export function listBidsForJob(jobId: string): BidRecord[] {
  return bids.filter((b) => b.jobId === jobId);
}

export function listBidsByCarrier(carrierId: string): BidRecord[] {
  return bids.filter((b) => b.carrierId === carrierId);
}

export function getBid(id: string): BidRecord | undefined {
  return bids.find((b) => b.id === id);
}

export function createBid(
  jobId: string,
  data: { amountAED: number; etaMinutes: number; truckType: string; driverName?: string; notes?: string },
  carrier: { id: string; name: string; rating: number; completedJobs: number }
): BidRecord | undefined {
  const job = getJob(jobId);
  if (!job) return undefined;
  if (job.status !== 'OPEN' && job.status !== 'BIDDING') {
    throw Object.assign(new Error('This job is no longer accepting bids'), { status: 400 });
  }

  const now = new Date().toISOString();
  const bid: BidRecord = {
    id: `bid-${Date.now()}`,
    jobId,
    carrierId: carrier.id,
    carrierName: carrier.name,
    carrierRating: carrier.rating,
    completedJobs: carrier.completedJobs,
    amountAED: data.amountAED,
    etaMinutes: data.etaMinutes,
    truckType: data.truckType,
    driverName: data.driverName,
    notes: data.notes,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  bids.unshift(bid);
  trackBid(jobId, data.amountAED);
  return bid;
}

export function updateBid(id: string, data: Partial<Pick<BidRecord, 'amountAED' | 'etaMinutes' | 'truckType' | 'driverName' | 'notes'>>): BidRecord | undefined {
  const bid = bids.find((b) => b.id === id);
  if (!bid) return undefined;
  if (bid.status !== 'PENDING') {
    throw Object.assign(new Error('Only pending bids can be updated'), { status: 400 });
  }
  Object.assign(bid, data, { updatedAt: new Date().toISOString() });
  return bid;
}

export function acceptBid(id: string): { bid: BidRecord; job: ReturnType<typeof getJob> } | undefined {
  const bid = bids.find((b) => b.id === id);
  if (!bid) return undefined;

  bid.status = 'ACCEPTED';
  bid.updatedAt = new Date().toISOString();

  bids.forEach((b) => {
    if (b.jobId === bid.jobId && b.id !== bid.id) {
      b.status = 'REJECTED';
      b.updatedAt = new Date().toISOString();
    }
  });

  const job = awardJob(bid.jobId, bid.carrierId, bid.carrierName, bid.amountAED);
  return { bid, job };
}

export function rejectBid(id: string): BidRecord | undefined {
  const bid = bids.find((b) => b.id === id);
  if (!bid) return undefined;
  bid.status = 'REJECTED';
  bid.updatedAt = new Date().toISOString();
  return bid;
}

export function setBidStatus(id: string, status: BidStatus): BidRecord | undefined {
  const bid = bids.find((b) => b.id === id);
  if (!bid) return undefined;
  bid.status = status;
  bid.updatedAt = new Date().toISOString();
  return bid;
}
