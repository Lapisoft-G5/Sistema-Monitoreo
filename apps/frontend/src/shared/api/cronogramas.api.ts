import type {
  IVisita,
  ICreateVisitaRequest,
  IUpdateVisitaRequest,
  IQueryVisitas,
} from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const cronogramasApi = {
  findAll: async (
    query?: IQueryVisitas,
  ): Promise<{ ok: boolean; data?: IVisita[]; error?: unknown }> => {
    try {
      const url = new URL(`${getApiBaseUrl()}/api/cronogramas`);
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

  findById: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IVisita; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cronogramas/${id}`, {
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

  create: async (
    payload: ICreateVisitaRequest,
  ): Promise<{ ok: boolean; data?: IVisita; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cronogramas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
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

  update: async (
    id: string,
    payload: IUpdateVisitaRequest,
  ): Promise<{ ok: boolean; data?: IVisita; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cronogramas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
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

  delete: async (
    id: string,
  ): Promise<{ ok: boolean; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cronogramas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  },
};
