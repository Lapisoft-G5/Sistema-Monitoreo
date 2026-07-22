import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  IDirectorDashboardResponse,
  IUgelDashboardInstitucionDetalle,
  IUgelDashboardResponse,
} from '@sistema-monitoreo/shared-contracts';
import { DashboardService } from '../services/dashboard.service.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import type { SessionScope } from '../repositories/dashboard.repository.js';
import type { JwtPayload } from '../../auth/services/auth-token.service.js';

interface AuthenticatedRequest {
  user?: JwtPayload;
}

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
  async director(@Req() req: AuthenticatedRequest): Promise<IDirectorDashboardResponse> {
    return this.service.getDirectorDashboard(this.toSession(req));
  }

  /**
   * GET /api/dashboard/ugel
   * KPIs institucionales, semáforo y monitoreos recientes a nivel provincial.
   */
  @Get('ugel')
  @RequirePermissions('dashboard:read')
  async ugel(
    @Req() req: AuthenticatedRequest,
    @Query('anio') anio?: string,
  ): Promise<IUgelDashboardResponse> {
    const anioNumber = anio ? parseInt(anio, 10) : undefined;
    return this.service.getUgelDashboard(this.toSession(req), anioNumber);
  }

  /**
   * GET /api/dashboard/institucion/:id
   * Detalle de una IE (director, docentes, monitoreos y cobertura) para el mapa.
   */
  @Get('institucion/:id')
  @RequirePermissions('dashboard:read')
  async institucion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Query('anio') anio?: string,
  ): Promise<IUgelDashboardInstitucionDetalle> {
    const anioNumber = anio ? parseInt(anio, 10) : undefined;
    return this.service.getInstitucionDetalle(this.toSession(req), id, anioNumber);
  }

  private toSession(req: AuthenticatedRequest): SessionScope {
    if (!req.user) {
      throw new ForbiddenException('Sesión no encontrada.');
    }
    return {
      id: req.user.sub,
      role: req.user.role,
      institucionId: req.user.institucion_id ?? null,
      especialistaNivel: req.user.especialista_nivel ?? null,
      especialistaEspecialidades: req.user.especialista_especialidades ?? null,
    };
  }
}
