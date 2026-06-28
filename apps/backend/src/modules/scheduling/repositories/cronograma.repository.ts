/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  IVisita,
  ISolicitudReprogramacion,
  TipoMonitoreo,
  EstadoVisita,
  EstadoSolicitudReprogramacion,
} from '@sistema-monitoreo/shared-contracts';

export interface CreateVisitaData {
  monitorId: string;
  institucionId: string;
  evaluadoId: string;
  tipoMonitoreo: TipoMonitoreo;
  numeroVisita: number;
  fechaProgramada: Date;
  horaInicio: string;
  modalidad: 'EBR' | 'EBA' | 'EBE' | 'CEPTRO';
  nivelEducativo: string;
  detalles?: string;
  creadoPorId: string | null;
}

export interface UpdateVisitaData {
  fechaProgramada?: Date;
  horaInicio?: string;
  detalles?: string;
  estado?: EstadoVisita;
}

export interface CreateSolicitudData {
  cronogramaId: string;
  solicitanteId: string;
  solicitanteRolAlCrear: string;
  fechaOriginal: Date;
  horaOriginal: string;
  fechaPropuesta: Date;
  horaPropuesta: string;
  justificacion: string;
  archivoSustentoUrl: string;
}

export interface ResolverSolicitudData {
  estado: 'APROBADO' | 'RECHAZADO';
  resueltoPorId: string;
  comentarioResolucion: string;
}

export abstract class CronogramaRepository {
  abstract findAll(filters?: any): Promise<IVisita[]>;
  abstract findById(id: string): Promise<IVisita | null>;
  abstract findPlanVigentePara(institucionId: string, anio: number): Promise<string | null>;
  abstract validateEntidadesActivas(institucionId: string, monitorId: string, evaluadoId: string): Promise<{ institucion: boolean; monitor: boolean; evaluado: boolean; monitorCargo?: string }>;
  abstract countPendientesByMonitor(monitorId: string): Promise<number>;
  abstract create(data: CreateVisitaData): Promise<IVisita>;
  abstract update(id: string, data: UpdateVisitaData): Promise<IVisita>;
  abstract remove(id: string): Promise<void>;
  abstract findMonitorEspecialidades(
    monitorId: string,
  ): Promise<Array<{ especialidad: { nombre: string } }>>;
  abstract applyReprogramacion(
    cronogramaId: string,
    fechaProgramada: Date,
    horaInicio: string,
  ): Promise<void>;
}

export abstract class SolicitudReprogramacionRepository {
  abstract findAll(filters?: any): Promise<ISolicitudReprogramacion[]>;
  abstract findById(id: string): Promise<ISolicitudReprogramacion | null>;
  abstract findPendienteByCronograma(
    cronogramaId: string,
  ): Promise<ISolicitudReprogramacion | null>;
  abstract create(data: CreateSolicitudData): Promise<ISolicitudReprogramacion>;
  abstract resolver(id: string, data: ResolverSolicitudData): Promise<ISolicitudReprogramacion>;
}
