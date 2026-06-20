import type {
  IPlantilla,
  IUpdatePlantillaResponse,
  EstadoPlantilla,
  TipoPlantilla,
} from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export interface CreatePlantillaInput {
  tipoMonitoreo: TipoPlantilla;
  anioAcademico: number;
  baremo: 'Vigente' | 'Porcentual';
  descripcion?: string;
  niveles: any[];
  desempenos: any[];
}

export interface UpdatePlantillaInput {
  baremo?: 'Vigente' | 'Porcentual';
  descripcion?: string;
  niveles?: any[];
  desempenos?: any[];
}

export const plantillasApi = {
  findAll: (query?: { anioAcademico?: number; tipoMonitoreo?: TipoPlantilla; estado?: EstadoPlantilla }) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return request<IPlantilla[]>(`/api/plantillas${qs ? '?' + qs : ''}`);
  },

  findById: (id: string) => request<IPlantilla>(`/api/plantillas/${id}`),

  create: (data: CreatePlantillaInput) =>
    request<IPlantilla>('/api/plantillas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePlantillaInput) =>
    request<IUpdatePlantillaResponse>(`/api/plantillas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cambiarEstado: (id: string, estado: EstadoPlantilla) =>
    request<IPlantilla>(`/api/plantillas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  duplicar: (id: string, descripcion?: string) =>
    request<IPlantilla>(`/api/plantillas/${id}/duplicar`, {
      method: 'POST',
      body: JSON.stringify({ descripcion }),
    }),
};
