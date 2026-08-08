import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi } from './api';

describe('fetchApi', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the v1 API base URL with JSON headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'job-1' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchApi<{ id: string }>('/jobs');
    expect(result).toEqual({ id: 'job-1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/jobs',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
  });

  it('attaches the bearer token when present', async () => {
    localStorage.setItem('loadbyton_token', 'jwt-token-123');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchApi('/jobs');

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token-123');
  });

  it('merges caller-provided headers with defaults', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchApi('/jobs', { headers: { 'X-Custom': 'yes' } });

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Custom']).toBe('yes');
  });

  it('throws the server error message on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Job not found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/jobs/job-999')).rejects.toThrow('Job not found');
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('invalid json');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/jobs')).rejects.toThrow('Network response error');
  });

  it('propagates network failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/jobs')).rejects.toThrow('Network down');
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });
});
