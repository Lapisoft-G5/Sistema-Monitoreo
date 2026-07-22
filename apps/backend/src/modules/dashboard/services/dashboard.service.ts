import { Injectable } from '@nestjs/common';
import type {
  IDirectorDashboardResponse,
  IUgelDashboardInstitucionDetalle,
  IUgelDashboardResponse,
} from '@sistema-monitoreo/shared-contracts';
import { DashboardRepository, SessionScope } from '../repositories/dashboard.repository.js';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getDirectorDashboard(session: SessionScope): Promise<IDirectorDashboardResponse> {
    return this.repository.getDirectorDashboard(session);
  }

  async getUgelDashboard(session: SessionScope, anio?: number): Promise<IUgelDashboardResponse> {
    const anioResuelto = anio && anio > 0 ? anio : new Date().getFullYear();
    return this.repository.getUgelDashboard(session, anioResuelto);
  }

  async getInstitucionDetalle(
    session: SessionScope,
    institucionId: string,
    anio?: number,
  ): Promise<IUgelDashboardInstitucionDetalle> {
    const anioResuelto = anio && anio > 0 ? anio : new Date().getFullYear();
    return this.repository.getInstitucionDetalle(session, institucionId, anioResuelto);
  }
}
