import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import { EspecialistasCargosService } from '../services/especialistas-cargos.service.js';
import { AddEspecialistaCargoDto, FinalizeEspecialistaCargoDto } from '../dto/cargos.dto.js';

@Controller('especialistas/:especialistaId/cargos')
@UseGuards(AuthGuard, PermissionsGuard)
export class EspecialistasCargosController {
  constructor(private readonly service: EspecialistasCargosService) {}

  @Get()
  @RequirePermissions('especialistas:read')
  async list(@Param('especialistaId', new ParseUUIDPipe()) especialistaId: string) {
    return this.service.list(especialistaId);
  }

  @Post()
  @RequirePermissions('especialistas:write')
  async add(
    @Param('especialistaId', new ParseUUIDPipe()) especialistaId: string,
    @Body() dto: AddEspecialistaCargoDto,
  ) {
    return this.service.add(
      especialistaId,
      dto.cargo,
      dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
    );
  }

  @Patch(':cargoAsignadoId/fin')
  @RequirePermissions('especialistas:write')
  async finalize(
    @Param('especialistaId', new ParseUUIDPipe()) especialistaId: string,
    @Param('cargoAsignadoId', new ParseUUIDPipe()) cargoAsignadoId: string,
    @Body() dto: FinalizeEspecialistaCargoDto,
  ) {
    return this.service.finalize(
      especialistaId,
      cargoAsignadoId,
      dto.fechaFin ? new Date(dto.fechaFin) : undefined,
    );
  }
}
