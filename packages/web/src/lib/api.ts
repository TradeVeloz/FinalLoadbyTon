const API_BASE_URL = '/api/v1';

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
