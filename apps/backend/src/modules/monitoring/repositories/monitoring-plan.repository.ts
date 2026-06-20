import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';
import type { QueryPlanDto } from '../dto/query-plan.dto.js';

export abstract class MonitoringPlanRepository {
  abstract findAll(filters?: QueryPlanDto): Promise<IMonitoringPlanResponse[]>;
  abstract findById(id: string): Promise<IMonitoringPlanResponse | null>;
  abstract create(data: {
    titulo: string;
    anioAcademico: number;
    tipoEntidad: string;
    archivoUrl: string;
  }): Promise<IMonitoringPlanResponse>;
  abstract delete(id: string): Promise<IMonitoringPlanResponse>;
}
