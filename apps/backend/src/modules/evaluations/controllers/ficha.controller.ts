import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import type { IFichaMonitoreo } from '@sistema-monitoreo/shared-contracts';
import { FichaService, type SessionUser } from '../services/ficha.service.js';
import {
  CreateFichaDto,
  SaveRespuestaDesempenoDto,
  FinalizarFichaDto,
} from '../dto/ficha.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';

@Controller('fichas')
@UseGuards(AuthGuard, PermissionsGuard)
export class FichaController {
  constructor(private readonly service: FichaService) {}

  @Post()
  @RequirePermissions('monitoreo:execute')
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Body() dto: CreateFichaDto,
    @Req() req: any,
  ): Promise<IFichaMonitoreo> {
    return this.service.crear(dto, this.toSession(req));
  }

  @Get('visita/:cronogramaId')
  @RequirePermissions('monitoreo:execute')
  async porVisita(
    @Param('cronogramaId', new ParseUUIDPipe()) cronogramaId: string,
    @Req() req: any,
  ): Promise<IFichaMonitoreo | null> {
    return this.service.findByVisitaId(cronogramaId, this.toSession(req));
  }

  @Get(':id')
  @RequirePermissions('monitoreo:execute')
  async porId(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ): Promise<IFichaMonitoreo> {
    return this.service.findById(id, this.toSession(req));
  }

  @Patch(':id/respuestas-desempeno')
  @RequirePermissions('monitoreo:execute')
  async guardarRespuesta(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SaveRespuestaDesempenoDto,
    @Req() req: any,
  ): Promise<IFichaMonitoreo> {
    return this.service.guardarRespuesta(id, dto, this.toSession(req));
  }

  @Patch(':id/respuestas-aspecto/:aspectoId')
  @RequirePermissions('monitoreo:execute')
  async guardarRespuestaAspecto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('aspectoId', new ParseUUIDPipe()) aspectoId: string,
    @Body() body: { marcado: boolean },
    @Req() req: any,
  ): Promise<IFichaMonitoreo> {
    return this.service.guardarRespuestaAspecto(id, aspectoId, body.marcado, this.toSession(req));
  }

  @Patch(':id/finalizar')
  @RequirePermissions('monitoreo:execute')
  async finalizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: FinalizarFichaDto,
    @Req() req: any,
  ): Promise<IFichaMonitoreo> {
    return this.service.finalizar(id, dto, this.toSession(req));
  }

  private toSession(req: any): SessionUser {
    if (!req.user) {
      throw new ForbiddenException('Sesion no encontrada.');
    }
    return {
      id: req.user.sub,
      role: req.user.role,
      institucionId: req.user.institucion_id ?? null,
    };
  }
}
