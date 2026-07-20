import { Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import type { IDirectorDashboardResponse } from '@sistema-monitoreo/shared-contracts';
import { DashboardService } from '../services/dashboard.service.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import type { SessionScope } from '../repositories/dashboard.repository.js';

@Controller('dashboard')
@UseGuards(AuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /**
   * GET /api/dashboard/director
   * KPIs, semáforo y monitoreos recientes de la IE del director autenticado.
   */
  @Get('director')
  @RequirePermissions('dashboard:read')
  async director(@Req() req: { user?: any }): Promise<IDirectorDashboardResponse> {
    return this.service.getDirectorDashboard(this.toSession(req));
  }

  private toSession(req: { user?: any }): SessionScope {
    if (!req.user) {
      throw new ForbiddenException('Sesión no encontrada.');
    }
    return {
      id: req.user.sub,
      role: req.user.role,
      institucionId: req.user.institucion_id ?? null,
      especialistaNivel: req.user.especialista_nivel ?? null,
    };
  }
}
