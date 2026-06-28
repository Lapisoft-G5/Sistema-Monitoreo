import type {
  IMonitoringPlanResponse,
  IPlanInstitucionCubierta,
} from '@sistema-monitoreo/shared-contracts';
import type { QueryPlanDto } from '../dto/query-plan.dto.js';

export interface CreatePlanData {
  titulo: string;
  anioAcademico: number;
  archivoUrl: string;
  tipoEntidad: string;
  estado?: string;
  autorId: string;
  rolAutorAlCrear: string;
  institucionId: string | null;
}

export abstract class MonitoringPlanRepository {
  abstract findAll(filters?: QueryPlanDto): Promise<IMonitoringPlanResponse[]>;
  abstract findById(id: string): Promise<IMonitoringPlanResponse | null>;
  abstract create(data: CreatePlanData): Promise<IMonitoringPlanResponse>;
  abstract softDelete(id: string): Promise<IMonitoringPlanResponse>;
  abstract hardDelete(id: string): Promise<boolean>;
  abstract restore(id: string): Promise<IMonitoringPlanResponse>;
  abstract findCobertura(planId: string): Promise<IPlanInstitucionCubierta[]>;
  abstract addCobertura(planId: string, institucionId: string): Promise<void>;
  abstract removeCobertura(planId: string, institucionId: string): Promise<void>;
}
