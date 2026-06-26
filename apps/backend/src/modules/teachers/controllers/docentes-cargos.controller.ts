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
import { DocentesCargosService } from '../services/docentes-cargos.service.js';
import { AddDocenteCargoDto, FinalizeDocenteCargoDto } from '../dto/cargos.dto.js';

@Controller('docentes/:docenteId/cargos')
@UseGuards(AuthGuard, PermissionsGuard)
export class DocentesCargosController {
  constructor(private readonly service: DocentesCargosService) {}

  @Get()
  @RequirePermissions('docentes:read')
  async list(@Param('docenteId', new ParseUUIDPipe()) docenteId: string) {
    return this.service.list(docenteId);
  }

  @Post()
  @RequirePermissions('docentes:write')
  async add(
    @Param('docenteId', new ParseUUIDPipe()) docenteId: string,
    @Body() dto: AddDocenteCargoDto,
  ) {
    return this.service.add(
      docenteId,
      dto.cargo,
      dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
    );
  }

  @Patch(':cargoAsignadoId/fin')
  @RequirePermissions('docentes:write')
  async finalize(
    @Param('docenteId', new ParseUUIDPipe()) docenteId: string,
    @Param('cargoAsignadoId', new ParseUUIDPipe()) cargoAsignadoId: string,
    @Body() dto: FinalizeDocenteCargoDto,
  ) {
    return this.service.finalize(
      docenteId,
      cargoAsignadoId,
      dto.fechaFin ? new Date(dto.fechaFin) : undefined,
    );
  }
}
