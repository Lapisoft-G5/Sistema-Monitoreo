import type { IMonitoringPlanResponse, IPlanInstitucionCubierta } from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    ...init,
    headers: { ...init?.headers },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const planesMonitoreoApi = {
  findAll: (query?: { search?: string; anioAcademico?: number; tipoEntidad?: string; estado?: string }) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return request<IMonitoringPlanResponse[]>(`/api/planes-monitoreo${qs ? '?' + qs : ''}`);
  },

  findById: (id: string) => request<IMonitoringPlanResponse>(`/api/planes-monitoreo/${id}`),

  findCobertura: (id: string) =>
    request<IPlanInstitucionCubierta[]>(`/api/planes-monitoreo/${id}/cobertura`),

  create: (formData: FormData) =>
    request<IMonitoringPlanResponse>('/api/planes-monitoreo', {
      method: 'POST',
      body: formData,
    }),

  toggleEstado: (id: string) =>
    request<IMonitoringPlanResponse>(`/api/planes-monitoreo/${id}`, {
      method: 'DELETE',
    }),

  archivoUrl: (id: string) => `${getApiBaseUrl()}/api/planes-monitoreo/${id}/archivo`,
};
