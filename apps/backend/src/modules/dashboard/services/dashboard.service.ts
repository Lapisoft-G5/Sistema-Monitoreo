import { Injectable } from '@nestjs/common';
import type { IDirectorDashboardResponse } from '@sistema-monitoreo/shared-contracts';
import { DashboardRepository, SessionScope } from '../repositories/dashboard.repository.js';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getDirectorDashboard(session: SessionScope): Promise<IDirectorDashboardResponse> {
    return this.repository.getDirectorDashboard(session);
  }
}
