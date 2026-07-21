import type {
  ICrearSolicitudVisitaRequest,
  IResolverSolicitudVisitaRequest,
  ISolicitudesVisitaResponse,
  ISolicitudVisita,
} from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

export const visitsApi = {
  solicitar: (body: ICrearSolicitudVisitaRequest) =>
    request<ISolicitudVisita>('/api/solicitudes-visita', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listar: (estado?: string) =>
    request<ISolicitudesVisitaResponse>(
      `/api/solicitudes-visita${estado ? `?estado=${estado}` : ''}`,
    ),
  atender: (id: string, body?: IResolverSolicitudVisitaRequest) =>
    request<{ success: true }>(`/api/solicitudes-visita/${id}/atender`, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }),
  rechazar: (id: string, body?: IResolverSolicitudVisitaRequest) =>
    request<{ success: true }>(`/api/solicitudes-visita/${id}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }),
};
