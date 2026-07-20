import type {
  ICreateInstitucionRequest,
  IInstitucionResponse,
  IQueryInstitucionRequest,
  IInstitucionListResponse,
  IUpdateInstitucionRequest,
  IUpdateInstitucionResponse,
} from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

function buildUrl(base: string, query?: Record<string, unknown>): string {
  if (!query) return base;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      params.append(key, String(val));
    }
  });
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export const institutionsApi = {
  findAll: async (
    query?: IQueryInstitucionRequest,
  ): Promise<{ ok: boolean; data?: IInstitucionListResponse; error?: unknown }> => {
    try {
      const data = await request<IInstitucionListResponse>(
        buildUrl('/api/instituciones', query as Record<string, unknown>),
      );
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  findById: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IInstitucionResponse; error?: unknown }> => {
    try {
      const data = await request<IInstitucionResponse>(`/api/instituciones/${id}`);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  create: async (
    dto: ICreateInstitucionRequest,
  ): Promise<{ ok: boolean; data?: IInstitucionResponse; error?: unknown }> => {
    try {
      const data = await request<IInstitucionResponse>('/api/instituciones', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  update: async (
    id: string,
    dto: IUpdateInstitucionRequest,
  ): Promise<{ ok: boolean; data?: IInstitucionResponse; error?: unknown }> => {
    try {
      const data = await request<IInstitucionResponse>(`/api/instituciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  softDelete: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IUpdateInstitucionResponse; error?: unknown }> => {
    try {
      const data = await request<IUpdateInstitucionResponse>(`/api/instituciones/${id}/baja`, {
        method: 'PATCH',
      });
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  restore: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IUpdateInstitucionResponse; error?: unknown }> => {
    try {
      const data = await request<IUpdateInstitucionResponse>(`/api/instituciones/${id}/alta`, {
        method: 'PATCH',
      });
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  getDashboardStats: async (): Promise<{ ok: boolean; data?: any; error?: unknown }> => {
    try {
      const data = await request<any>(`/api/instituciones/dashboard/stats`);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },
};
