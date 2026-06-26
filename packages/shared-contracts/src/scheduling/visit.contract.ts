export type TipoMonitoreo = 'DOCENTE' | 'DIRECTIVO';

export type EstadoVisita =
  | 'PROGRAMADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'REPROGRAMADO'
  | 'CANCELADO';

export type EstadoSolicitudReprogramacion = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export type Modalidad = 'EBR' | 'EBA' | 'EBE' | 'CEPTRO';

export interface IVisita {
  id: string;
  monitorId: string;
  institucionId: string;
  evaluadoId: string;
  planId: string | null;
  tipoMonitoreo: TipoMonitoreo;
  numeroVisita: number;
  fechaProgramada: string;
  horaInicio: string;
  detalles: string | null;
  estado: EstadoVisita;
  modalidad: Modalidad;
  nivelEducativo: string;
  creadoPorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateVisitaRequest {
  monitorId: string;
  institucionId: string;
  evaluadoId: string;
  tipoMonitoreo: TipoMonitoreo;
  numeroVisita: number;
  fechaProgramada: string;
  horaInicio: string;
  detalles?: string;
  modalidad: Modalidad;
  nivelEducativo: string;
}

export interface IUpdateVisitaRequest {
  fechaProgramada?: string;
  horaInicio?: string;
  detalles?: string;
  estado?: EstadoVisita;
}

export interface IPlanCobertura {
  id: string;
  planId: string;
  institucionId: string;
}

export interface ISolicitudReprogramacion {
  id: string;
  cronogramaId: string;
  solicitanteId: string;
  solicitanteRolAlCrear: string;
  fechaOriginal: string;
  horaOriginal: string;
  fechaPropuesta: string;
  horaPropuesta: string;
  justificacion: string;
  archivoSustentoUrl: string;
  estado: EstadoSolicitudReprogramacion;
  resueltoPorId: string | null;
  resueltoPorNombre?: string | null;
  resueltoPorRol?: string | null;
  comentarioResolucion: string | null;
  fechaResolucion: string | null;
  createdAt: string;
}

export interface ICreateSolicitudReprogramacionRequest {
  cronogramaId: string;
  fechaPropuesta: string;
  horaPropuesta: string;
  justificacion: string;
  archivoSustentoBase64?: string;
  archivoSustentoNombre?: string;
}

export interface IResolverSolicitudRequest {
  comentario: string;
}

export interface IQueryVisitas {
  monitorId?: string;
  institucionId?: string;
  estado?: EstadoVisita;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoMonitoreo?: TipoMonitoreo;
}
