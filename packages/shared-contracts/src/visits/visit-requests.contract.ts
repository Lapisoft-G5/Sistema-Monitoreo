/**
 * Solicitudes de visita: el Director UGEL solicita/prioriza una visita de
 * monitoreo a una IE; el Jefe de Gestión la atiende (agenda) o la rechaza.
 */

export type PrioridadVisita = 'ALTA' | 'NORMAL';
export type EstadoSolicitudVisita = 'PENDIENTE' | 'ATENDIDA' | 'RECHAZADA';

export interface ICrearSolicitudVisitaRequest {
  institucionId: string;
  /** Docente/directivo específico al que hay que visitar (opcional). */
  docenteId?: string;
  motivo?: string;
  prioridad?: PrioridadVisita;
}

export interface IResolverSolicitudVisitaRequest {
  comentario?: string;
  cronogramaId?: string;
}

export interface ISolicitudVisita {
  id: string;
  institucionId: string;
  institucionNombre: string;
  distrito: string;
  docenteId: string | null;
  docenteNombre: string | null;
  motivo: string | null;
  prioridad: PrioridadVisita | string;
  estado: EstadoSolicitudVisita | string;
  solicitanteNombre: string;
  createdAt: string;
  resueltaAt: string | null;
}

export interface ISolicitudesVisitaResponse {
  items: ISolicitudVisita[];
  pendientes: number;
}
