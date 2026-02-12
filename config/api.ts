const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : process.env.NODE_ENV === 'production'
      ? window.location.origin + '/api' // Ou sua URL de produção
      : 'http://localhost:8080'
);

console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Config] API_URL Final:', API_URL);

export async function http<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!API_URL) {
    throw new Error('API_URL não configurada. Configure VITE_API_URL no arquivo .env');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[API Error] ${response.status} - ${endpoint}:`, error);
      throw new Error(error || `Erro ${response.status} na requisição`);
    }

    // Se o status for 204 (No Content), retorna undefined
    if (response.status === 204) {
      return;
    }

    return response.json();
  } catch (error) {
    console.error(`[API Critical Error] ${endpoint}:`, error);
    throw error;
  }
}