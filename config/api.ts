const API_URL = import.meta.env.VITE_API_URL;

export async function http<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro na requisição");
  }

  return response.json();
}