import { useCallback, useEffect, useState } from 'react';
import { Job, JobStatus } from '../types';
import { fetchApi } from '../lib/api';

export interface JobFilters {
  status?: string;
  terminal?: string;
  area?: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (filters: JobFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.terminal) params.set('terminal', filters.terminal);
      if (filters.area) params.set('area', filters.area);
      const qs = params.toString();
      const data = await fetchApi<Job[]>(`/jobs${qs ? `?${qs}` : ''}`);
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: string): Promise<Job> => {
    return fetchApi<Job>(`/jobs/${id}`);
  }, []);

  const createJob = useCallback(async (payload: Record<string, unknown>): Promise<Job> => {
    return fetchApi<Job>('/jobs', { method: 'POST', body: JSON.stringify(payload) });
  }, []);

  const updateJobStatus = useCallback(async (id: string, status: JobStatus): Promise<Job> => {
    return fetchApi<Job>(`/jobs/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refresh: fetchJobs, getJob, createJob, updateJobStatus };
}
