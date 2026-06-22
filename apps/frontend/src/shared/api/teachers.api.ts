import type {
  ICreateDocenteRequest,
  IDocenteResponse,
  IUpdateDocenteRequest,
  IBajaDocenteResponse,
} from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const teachersApi = {
  findAll: async (): Promise<{ ok: boolean; data?: IDocenteResponse[]; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes`, {
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
    dto: ICreateDocenteRequest,
  ): Promise<{ ok: boolean; data?: IDocenteResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes`, {
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

  update: async (
    id: string,
    dto: IUpdateDocenteRequest,
  ): Promise<{ ok: boolean; data?: IDocenteResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes/${id}`, {
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

  deactivate: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IBajaDocenteResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes/${id}/baja`, {
        method: 'PATCH',
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

  activate: async (
    id: string,
  ): Promise<{ ok: boolean; data?: IBajaDocenteResponse; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes/${id}/alta`, {
        method: 'PATCH',
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

  getCargos: async (): Promise<{
    ok: boolean;
    data?: Array<{ id: string; nombre: string }>;
    error?: unknown;
  }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes/cargos`, {
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

  findByDni: async (
    dni: string,
  ): Promise<{ ok: boolean; data?: unknown; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/docentes/buscar/${dni}`, {
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

  finalizeCargo: async (
    docenteId: string,
    docenteCargoId: string,
  ): Promise<{ ok: boolean; data?: unknown; error?: unknown }> => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/docentes/${docenteId}/cargos/${docenteCargoId}/fin`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
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
