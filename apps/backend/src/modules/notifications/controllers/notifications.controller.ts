import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  ICrearAlertaDistritoResponse,
  ICrearAlertaInstitucionResponse,
  INotificacionesResponse,
} from '@sistema-monitoreo/shared-contracts';
import { NotificationsService } from '../services/notifications.service.js';
import { SinVisitaCronService } from '../services/sin-visita-cron.service.js';
import { CrearAlertaDistritoDto, CrearAlertaInstitucionDto } from '../dto/crear-alerta.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import { JwtPayload } from '../../auth/services/auth-token.service.js';

interface AuthenticatedRequest {
  user?: JwtPayload;
}

@Controller('notificaciones')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
    private readonly sinVisita: SinVisitaCronService,
  ) {}

  /** Notificaciones del usuario autenticado (para la campanita). */
  @Get()
  async listar(@Req() req: AuthenticatedRequest): Promise<INotificacionesResponse> {
    return this.service.listar(this.userId(req));
  }

  @Patch(':id/leer')
  async marcarLeida(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: true }> {
    await this.service.marcarLeida(this.userId(req), id);
    return { success: true };
  }

  @Patch('leer-todas')
  async marcarTodasLeidas(@Req() req: AuthenticatedRequest): Promise<{ success: true }> {
    await this.service.marcarTodasLeidas(this.userId(req));
    return { success: true };
  }

  /** Enviar una alerta sobre una IE al Director de la IE y/o al Jefe de Gestión. */
  @Post('alerta-institucion')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('notificaciones:send')
  async alertaInstitucion(
    @Body() dto: CrearAlertaInstitucionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ICrearAlertaInstitucionResponse> {
    if (!req.user) throw new ForbiddenException('Sesión no encontrada.');
    const nombre =
      `${req.user.nombres ?? ''} ${req.user.apellidos ?? ''}`.trim() || 'Director UGEL';
    return this.service.crearAlertaInstitucion(dto, { id: req.user.sub, nombre });
  }

  /** Enviar una alerta a los Jefes de Gestión sobre un distrito con promedio crítico. */
  @Post('alerta-distrito')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('notificaciones:send')
  async alertaDistrito(
    @Body() dto: CrearAlertaDistritoDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ICrearAlertaDistritoResponse> {
    if (!req.user) throw new ForbiddenException('Sesión no encontrada.');
    const nombre =
      `${req.user.nombres ?? ''} ${req.user.apellidos ?? ''}`.trim() || 'Director UGEL';
    return this.service.crearAlertaDistrito(dto, { id: req.user.sub, nombre });
  }

  /** Ejecuta manualmente el barrido de "IE sin visita" (además del cron diario). */
  @Post('barrido-sin-visita')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('notificaciones:send')
  async barridoSinVisita(): Promise<{ alertas: number }> {
    const alertas = await this.sinVisita.ejecutarBarrido();
    return { alertas };
  }

  private userId(req: AuthenticatedRequest): string {
    if (!req.user) throw new ForbiddenException('Sesión no encontrada.');
    return req.user.sub;
  }
}
