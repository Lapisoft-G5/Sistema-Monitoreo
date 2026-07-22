import type {
  ICrearAlertaDistritoRequest,
  ICrearAlertaDistritoResponse,
  ICrearAlertaInstitucionRequest,
  ICrearAlertaInstitucionResponse,
  INotificacionesResponse,
} from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

export const notificationsApi = {
  list: () => request<INotificacionesResponse>('/api/notificaciones'),
  marcarLeida: (id: string) =>
    request<{ success: true }>(`/api/notificaciones/${id}/leer`, { method: 'PATCH' }),
  marcarTodas: () =>
    request<{ success: true }>('/api/notificaciones/leer-todas', { method: 'PATCH' }),
  alertaInstitucion: (body: ICrearAlertaInstitucionRequest) =>
    request<ICrearAlertaInstitucionResponse>('/api/notificaciones/alerta-institucion', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  alertaDistrito: (body: ICrearAlertaDistritoRequest) =>
    request<ICrearAlertaDistritoResponse>('/api/notificaciones/alerta-distrito', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
