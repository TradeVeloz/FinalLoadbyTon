import { JobStatus, TrackingRecord } from '../types';

const tracking: TrackingRecord[] = [
  {
    jobId: 'job-102',
    status: 'IN_TRANSIT',
    currentLocation: { lat: 25.0432, lng: 55.1173 },
    speedKmH: 58,
    etaMinutes: 24,
    driverName: 'Mohammed Al-Rashid',
    driverPhone: '+971 50 122 8890',
    vehiclePlate: 'D-88432',
    milestones: [
      { label: 'Job awarded', timestamp: new Date(Date.now() - 3600000 * 9).toISOString(), completed: true },
      { label: 'Gate pass issued', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), completed: true },
      { label: 'Container collected', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), completed: true },
      { label: 'In transit', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), completed: true },
      { label: 'Arrived at destination', timestamp: '', completed: false },
      { label: 'POD signed', timestamp: '', completed: false },
    ],
    points: [
      { lat: 24.9923, lng: 55.0633, speedKmH: 0, heading: 0, timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString() },
      { lat: 25.0101, lng: 55.0758, speedKmH: 42, heading: 40, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { lat: 25.0227, lng: 55.0934, speedKmH: 55, heading: 35, timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString() },
      { lat: 25.0334, lng: 55.1051, speedKmH: 61, heading: 30, timestamp: new Date(Date.now() - 3600000 * 0.6).toISOString() },
      { lat: 25.0432, lng: 55.1173, speedKmH: 58, heading: 28, timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString() },
    ],
    updatedAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
  },
];

export function getTracking(jobId: string): TrackingRecord | undefined {
  return tracking.find((t) => t.jobId === jobId);
}

export function upsertTracking(
  jobId: string,
  data: {
    status?: JobStatus;
    lat?: number;
    lng?: number;
    speedKmH?: number;
    etaMinutes?: number;
  }
): TrackingRecord {
  let record = tracking.find((t) => t.jobId === jobId);
  const now = new Date().toISOString();

  if (!record) {
    record = {
      jobId,
      status: data.status ?? 'AWARDED',
      milestones: [{ label: 'Job awarded', timestamp: now, completed: true }],
      points: [],
      updatedAt: now,
    };
    tracking.push(record);
  }

  if (data.status) record.status = data.status;
  if (data.lat !== undefined && data.lng !== undefined) {
    record.currentLocation = { lat: data.lat, lng: data.lng };
    record.points.push({
      lat: data.lat,
      lng: data.lng,
      speedKmH: data.speedKmH ?? 0,
      heading: 0,
      timestamp: now,
    });
    if (data.speedKmH !== undefined) record.speedKmH = data.speedKmH;
  }
  if (data.etaMinutes !== undefined) record.etaMinutes = data.etaMinutes;
  record.updatedAt = now;
  return record;
}
