function normalizeBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `https://${trimmed}`;
}

export function getApiBaseUrl(): string {
  const configured =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1');
  return normalizeBase(configured);
}

export function getSocketUrl(): string {
  const api = import.meta.env.VITE_API_URL as string | undefined;
  if (!api) return 'http://localhost:5000';
  return normalizeBase(api);
}

const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('loadbyton_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network response error' }));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`API call ${endpoint} fallback:`, err.message);
    throw err;
  }
}
