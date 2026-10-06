const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ponto_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirado
      localStorage.removeItem('ponto_token');
      localStorage.removeItem('ponto_user');
      window.dispatchEvent(new Event('auth-logout'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data.data;
  } catch (err: any) {
    // Se o backend não responder (ex: fetch failed por estar rodando apenas frontend puro)
    throw err;
  }
}
