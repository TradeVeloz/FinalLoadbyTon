import { useCallback } from 'react';
import { Bid, BidStatus } from '../types';
import { fetchApi } from '../lib/api';

export interface SubmitBidPayload {
  amountAED: number;
  etaMinutes: number;
  truckType: string;
  driverName?: string;
  notes?: string;
}

export function useBids() {
  const listBids = useCallback(async (jobId: string): Promise<Bid[]> => {
    return fetchApi<Bid[]>(`/bids/job/${jobId}`);
  }, []);

  const submitBid = useCallback(async (jobId: string, payload: SubmitBidPayload): Promise<Bid> => {
    return fetchApi<Bid>(`/bids/job/${jobId}`, { method: 'POST', body: JSON.stringify(payload) });
  }, []);

  const acceptBid = useCallback(async (bidId: string) => {
    return fetchApi<{ message: string }>(`/bids/${bidId}/accept`, { method: 'POST' });
  }, []);

  const rejectBid = useCallback(async (bidId: string) => {
    return fetchApi<{ message: string }>(`/bids/${bidId}/reject`, { method: 'POST' });
  }, []);

  const updateBidStatus = useCallback(async (bidId: string, status: BidStatus): Promise<Bid> => {
    return fetchApi<Bid>(`/bids/${bidId}`, { method: 'PUT', body: JSON.stringify({ status }) });
  }, []);

  return { listBids, submitBid, acceptBid, rejectBid, updateBidStatus };
}
