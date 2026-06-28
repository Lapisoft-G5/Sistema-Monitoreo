/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import type { IPlantilla, IUpdatePlantillaResponse } from '@sistema-monitoreo/shared-contracts';
import { PlantillaService } from '../services/plantilla.service.js';
import type { SessionUser } from '../../../shared/types/session-user.js';
import { CreatePlantillaDto } from '../dto/create-plantilla.dto.js';
import { DuplicarPlantillaDto, PatchEstadoPlantillaDto, UpdatePlantillaDto } from '../dto/update-plantilla.dto.js';
import { QueryPlantillaDto } from '../dto/query-plantilla.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';

@Controller('plantillas')
@UseGuards(AuthGuard, PermissionsGuard)
export class PlantillaController {
  constructor(private readonly service: PlantillaService) {}

  @Post()
  @RequirePermissions('monitoreo:execute')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePlantillaDto, @Req() req: any): Promise<IPlantilla> {
    return this.service.create(dto, this.toSession(req));
  }

  @Get()
  @RequirePermissions('monitoreo:execute')
  async findAll(@Query() query: QueryPlantillaDto, @Req() req: any): Promise<IPlantilla[]> {
    return this.service.findAll(query, this.toSession(req));
  }

  @Get(':id')
  @RequirePermissions('monitoreo:read')
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ): Promise<IPlantilla> {
    return this.service.findById(id, this.toSession(req));
  }

  @Put(':id')
  @RequirePermissions('monitoreo:execute')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePlantillaDto,
    @Req() req: any,
  ): Promise<IUpdatePlantillaResponse> {
    return this.service.update(id, dto, this.toSession(req));
  }

  @Patch(':id/estado')
  @RequirePermissions('monitoreo:execute')
  async cambiarEstado(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PatchEstadoPlantillaDto,
    @Req() req: any,
  ): Promise<IPlantilla> {
    return this.service.cambiarEstado(id, dto, this.toSession(req));
  }

  @Post(':id/duplicar')
  @RequirePermissions('monitoreo:execute')
  @HttpCode(HttpStatus.CREATED)
  async duplicar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: DuplicarPlantillaDto,
    @Req() req: any,
  ): Promise<IPlantilla> {
    return this.service.duplicar(id, this.toSession(req), body?.descripcion, body?.anioAcademico);
  }

  @Delete(':id')
  @RequirePermissions('monitoreo:execute')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ): Promise<{ id: string; deletedFichas: number; deletedEvidencias: number }> {
    return this.service.eliminar(id, this.toSession(req));
  }

  @Get(':id/fichas-count')
  @RequirePermissions('monitoreo:read')
  async countFichas(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ): Promise<{ count: number; estado: 'Borrador' | 'Vigente' | 'Historico' }> {
    return this.service.countFichas(id, this.toSession(req));
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
