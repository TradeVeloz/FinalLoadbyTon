import { BidRecord } from '../types';
import { uid } from '../utils/helpers';

export type BidEntity = BidRecord;

export function createBidEntity(
  data: Omit<BidRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): BidEntity {
  const now = new Date().toISOString();
  return { ...data, id: uid('bid'), status: 'PENDING', createdAt: now, updatedAt: now };
}

export function isBidPending(bid: BidEntity): boolean {
  return bid.status === 'PENDING';
}
