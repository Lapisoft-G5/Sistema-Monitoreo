import type { IFichaMonitoreo } from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const errText = await response.text();
    let errMessage = response.statusText;
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message || errJson.code || errMessage;
    } catch {
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage || `HTTP ${response.status}`);
  }
  const text = await response.text();
  if (!text) return null as unknown as T;
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export interface CreateFichaInput {
  cronogramaId: string;
  areaCurricular?: string;
  grado?: string;
  seccion?: string;
  cantidadEstudiantes?: number;
  cantidadEstudiantesNee?: number;
  cursoId?: string;
}

export interface SaveRespuestaDesempenoInput {
  desempenoId: string;
  nivel: number;
}

export const fichasApi = {
  findByVisita: (cronogramaId: string) =>
    request<IFichaMonitoreo | null>(`/api/fichas/visita/${cronogramaId}`),

  findById: (id: string) => request<IFichaMonitoreo>(`/api/fichas/${id}`),

  create: (data: CreateFichaInput) =>
    request<IFichaMonitoreo>('/api/fichas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveRespuestaDesempeno: (fichaId: string, desempenoId: string, nivel: number, observaciones?: string) =>
    request<IFichaMonitoreo>(`/api/fichas/${fichaId}/respuestas-desempeno`, {
      method: 'PATCH',
      body: JSON.stringify({ desempenoId, nivel, observaciones }),
    }),

  saveRespuestaAspecto: (fichaId: string, aspectoId: string, marcado: boolean) =>
    request<IFichaMonitoreo>(`/api/fichas/${fichaId}/respuestas-aspecto/${aspectoId}`, {
      method: 'PATCH',
      body: JSON.stringify({ marcado }),
    }),

  finalizar: (fichaId: string, observaciones?: string, sugerencias?: string, compromisos?: string) =>
    request<IFichaMonitoreo>(`/api/fichas/${fichaId}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify({ observaciones, sugerencias, compromisos }),
    }),

  migrarPlantilla: (fichaId: string, plantillaId: string) =>
    request<IFichaMonitoreo>(`/api/fichas/${fichaId}/migrar-plantilla`, {
      method: 'POST',
      body: JSON.stringify({ plantillaId }),
    }),
};
