import type {
  IPaginatedReportesFichas,
  IReporteResumenIE,
  NivelLogro,
  TipoMonitoreo,
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

export const reportesApi = {
  fichasCompletadas: (query?: {
    anioAcademico?: number;
    institucionId?: string;
    tipoMonitoreo?: TipoMonitoreo;
    nivelLogro?: NivelLogro;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return request<IPaginatedReportesFichas>(`/api/reportes/fichas-completadas${qs ? '?' + qs : ''}`);
  },

  resumenIE: (anio: number) =>
    request<IReporteResumenIE[]>(`/api/reportes/resumen-ie?anio=${anio}`),

  fichaHTMLUrl: (id: string) => `${getApiBaseUrl()}/api/reportes/ficha/${id}/export-html`,
};
