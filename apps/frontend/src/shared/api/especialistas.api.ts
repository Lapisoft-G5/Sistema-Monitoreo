import type {
  ICreateEspecialistaRequest,
  IEspecialistaResponse,
  IQueryEspecialistaRequest,
  IUpdateEspecialistaRequest,
} from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const especialistasApi = {
  findAll: async (query?: IQueryEspecialistaRequest): Promise<{ ok: boolean; data?: IEspecialistaResponse[]; error?: unknown }> => {
    try {
      const url = new URL(`${getApiBaseUrl()}/api/especialistas`);
      if (query) {
        Object.entries(query).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
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

  findById: async (id: string): Promise<{ ok: boolean; data?: IEspecialistaResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/especialistas/${id}`, {
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

  create: async (dto: ICreateEspecialistaRequest): Promise<{ ok: boolean; data?: IEspecialistaResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/especialistas`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
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

  update: async (id: string, dto: IUpdateEspecialistaRequest): Promise<{ ok: boolean; data?: IEspecialistaResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/especialistas/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
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

  delete: async (id: string): Promise<{ ok: boolean; data?: IEspecialistaResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/especialistas/${id}`, {
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
