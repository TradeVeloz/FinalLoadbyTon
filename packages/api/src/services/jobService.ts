import { JobRecord, JobStatus } from '../types';
import { generateJobCode } from '../utils/helpers';

export type JobFilters = {
  status?: string;
  terminal?: string;
  area?: string;
  shipperId?: string;
  carrierId?: string;
  date?: string;
};

const jobs: JobRecord[] = [
  {
    id: 'job-101',
    jobCode: 'LBT-DXB-2608-4921',
    shipperId: 'usr-shipper-1',
    shipperName: 'Al-Majid Global Freight LLC',
    containerSize: 'FORTY_HC',
    containerType: 'DRY',
    containerNumber: 'MSKU9281745',
    pickupTerminal: 'JEBEL_ALI_T2',
    deliveryArea: 'JAFZA_SOUTH',
    deliveryAddress: 'Street 14, Warehouse 8B, JAFZA South, Dubai',
    readyTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 18).toISOString(),
    maxBudgetAED: 1400,
    agreedPriceAED: 1250,
    status: 'BIDDING',
    requiresReefer: false,
    requiresHazmat: false,
    bidsCount: 4,
    lowestBidAED: 1180,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'job-102',
    jobCode: 'LBT-DXB-2608-8812',
    shipperId: 'usr-shipper-1',
    shipperName: 'CMA CGM Gulf Logistics',
    containerSize: 'TWENTY_FT',
    containerType: 'REEFER',
    containerNumber: 'CMAU8172930',
    pickupTerminal: 'JEBEL_ALI_T1',
    deliveryArea: 'AL_QUOZ',
    deliveryAddress: 'Industrial Area 3, Plot 42, Al Quoz, Dubai',
    readyTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24).toISOString(),
    maxBudgetAED: 1100,
    agreedPriceAED: 980,
    status: 'IN_TRANSIT',
    carrierId: 'usr-carrier-1',
    carrierName: 'Emirates Overland Haulage Co.',
    requiresReefer: true,
    requiresHazmat: false,
    bidsCount: 6,
    lowestBidAED: 980,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'job-103',
    jobCode: 'LBT-DXB-2608-1029',
    shipperId: 'usr-shipper-1',
    shipperName: 'Gulf Cargo Solutions',
    containerSize: 'FORTY_FT',
    containerType: 'HAZMAT',
    containerNumber: 'TCKU7739201',
    pickupTerminal: 'JEBEL_ALI_T3',
    deliveryArea: 'DIP',
    deliveryAddress: 'Dubai Investments Park 2, Logistics Gate 4',
    readyTime: new Date(Date.now() + 3600000 * 6).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 30).toISOString(),
    maxBudgetAED: 1850,
    status: 'OPEN',
    requiresReefer: false,
    requiresHazmat: true,
    hazmatClass: 'Class 3 Flammable Liquids',
    bidsCount: 2,
    lowestBidAED: 1650,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'job-104',
    jobCode: 'LBT-DXB-2608-7745',
    shipperId: 'usr-shipper-1',
    shipperName: 'Al-Majid Global Freight LLC',
    containerSize: 'FORTY_FT',
    containerType: 'DRY',
    containerNumber: 'MSKU8845612',
    pickupTerminal: 'JEBEL_ALI_T4',
    deliveryArea: 'DIP',
    deliveryAddress: 'Plot 18, DIP 1, Dubai',
    readyTime: new Date(Date.now() + 3600000 * 8).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 36).toISOString(),
    status: 'DRAFT',
    requiresReefer: false,
    requiresHazmat: false,
    bidsCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export function listJobs(filters: JobFilters = {}): JobRecord[] {
  let result = [...jobs];

  if (filters.status) result = result.filter((j) => j.status === filters.status);
  if (filters.terminal) result = result.filter((j) => j.pickupTerminal === filters.terminal);
  if (filters.area) result = result.filter((j) => j.deliveryArea === filters.area);
  if (filters.shipperId) result = result.filter((j) => j.shipperId === filters.shipperId);
  if (filters.carrierId) result = result.filter((j) => j.carrierId === filters.carrierId);

  if (filters.date) {
    const day = filters.date.slice(0, 10);
    result = result.filter((j) => j.createdAt.slice(0, 10) === day);
  }

  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getJob(idOrCode: string): JobRecord | undefined {
  return jobs.find((j) => j.id === idOrCode || j.jobCode === idOrCode);
}

export function createJob(
  data: Omit<JobRecord, 'id' | 'jobCode' | 'shipperId' | 'shipperName' | 'status' | 'bidsCount' | 'createdAt' | 'updatedAt'>,
  shipperId: string,
  shipperName: string
): JobRecord {
  const now = new Date().toISOString();
  const job: JobRecord = {
    id: `job-${Date.now()}`,
    jobCode: generateJobCode(),
    shipperId,
    shipperName,
    status: 'DRAFT',
    bidsCount: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  jobs.unshift(job);
  return job;
}

export function updateJob(id: string, data: Partial<Omit<JobRecord, 'id' | 'jobCode'>>): JobRecord | undefined {
  const job = jobs.find((j) => j.id === id);
  if (!job) return undefined;
  Object.assign(job, data, { updatedAt: new Date().toISOString() });
  return job;
}

export function deleteJob(id: string): boolean {
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return false;
  jobs.splice(idx, 1);
  return true;
}

export function submitJob(id: string): JobRecord | undefined {
  const job = jobs.find((j) => j.id === id);
  if (!job) return undefined;
  if (job.status !== 'DRAFT') {
    throw Object.assign(new Error('Only draft jobs can be submitted for bidding'), { status: 400 });
  }
  job.status = 'OPEN';
  job.updatedAt = new Date().toISOString();
  return job;
}

export function setJobStatus(id: string, status: JobStatus): JobRecord | undefined {
  const job = jobs.find((j) => j.id === id);
  if (!job) return undefined;
  job.status = status;
  job.updatedAt = new Date().toISOString();
  return job;
}

export function trackBid(jobId: string, amountAED: number): void {
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;
  job.bidsCount += 1;
  if (!job.lowestBidAED || amountAED < job.lowestBidAED) {
    job.lowestBidAED = amountAED;
  }
  job.updatedAt = new Date().toISOString();
}

export function awardJob(jobId: string, carrierId: string, carrierName: string, amountAED: number): JobRecord | undefined {
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return undefined;
  job.status = 'AWARDED';
  job.carrierId = carrierId;
  job.carrierName = carrierName;
  job.agreedPriceAED = amountAED;
  job.updatedAt = new Date().toISOString();
  return job;
}
