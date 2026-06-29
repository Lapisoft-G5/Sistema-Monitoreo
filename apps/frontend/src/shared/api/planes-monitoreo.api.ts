import type { IMonitoringPlanResponse, IPlanInstitucionCubierta } from '@sistema-monitoreo/shared-contracts';
import { request, API_BASE_URL } from '../config/api.js';

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

  hardDelete: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/planes-monitoreo/${id}/hard`, {
      method: 'DELETE',
    }),

  archivoUrl: (id: string) => `${API_BASE_URL}/api/planes-monitoreo/${id}/archivo`,
};
