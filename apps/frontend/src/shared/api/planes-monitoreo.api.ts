import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const planesMonitoreoApi = {
  findAll: async (query?: {
    search?: string;
    anioAcademico?: number;
    tipoEntidad?: string;
    estado?: string;
  }): Promise<{ ok: boolean; data?: IMonitoringPlanResponse[]; error?: unknown }> => {
    try {
      const url = new URL(`${getApiBaseUrl()}/api/planes-monitoreo`);
      if (query) {
        Object.entries(query).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            url.searchParams.append(key, String(val));
          }
        });
      }
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  create: async (formData: FormData): Promise<{ ok: boolean; data?: IMonitoringPlanResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/planes-monitoreo`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // FormData handles boundary and headers automatically
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  delete: async (id: string): Promise<{ ok: boolean; data?: IMonitoringPlanResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/planes-monitoreo/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },
};
