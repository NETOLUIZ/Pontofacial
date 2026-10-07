const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT_MS = 8000;

type RequestApiOptions = RequestInit & {
  timeoutMs?: number;
};

export async function requestApi<T>(endpoint: string, options: RequestApiOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event('auth-logout'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data.data;
  } catch (err: any) {
    // Se o backend não responder (ex: fetch failed por estar rodando apenas frontend puro)
    if (err?.name === 'AbortError') {
      throw new Error('O servidor demorou demais para responder');
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }
}
