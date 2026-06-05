import { Controller, Post, Get, Put, Patch, Body, Query, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InstitutionsService } from '../services/institutions.service.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import { IInstitucionResponse, IInstitucionListResponse, IUpdateInstitucionResponse } from '@sistema-monitoreo/shared-contracts';

@Controller('instituciones')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  /**
   * POST /api/instituciones
   * Registra una nueva Institución Educativa.
   * Valida código modular (7 dígitos). Conflicto (409) si ya existe.
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInstitucionDto): Promise<IInstitucionResponse> {
    return this.institutionsService.create(dto);
  }

  /**
   * GET /api/instituciones
   * Retorna listado de instituciones con filtros opcionales y paginación.
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleCode.JEFE_AREA, RoleCode.DIRECTOR_UGEL, RoleCode.COORDINADOR_PEDAGOGICO)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryInstitucionDto): Promise<IInstitucionListResponse> {
    return this.institutionsService.findAll(query);
  }

  /**
   * PUT /api/instituciones/:id
   * Actualiza los datos de una institución existente.
   * Descarta cualquier intento de modificar codigo_modular.
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInstitucionDto,
  ): Promise<IInstitucionResponse> {
    return this.institutionsService.update(id, dto);
  }

  /**
   * PATCH /api/instituciones/:id/baja
   * Realiza la baja lógica (Soft Delete) cambiando el estado a "Inactiva".
   * Requiere rol 'jefe_area'.
   */
  @Patch(':id/baja')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id') id: string): Promise<IUpdateInstitucionResponse> {
    await this.institutionsService.softDelete(id);
    return {
      success: true,
      message: 'Institución dada de baja correctamente',
    };
  }

  /**
   * PATCH /api/instituciones/:id/alta
   * Revierte la baja lógica cambiando el estado a "Activa".
   * Requiere rol 'jefe_area'.
   */
  @Patch(':id/alta')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string): Promise<IUpdateInstitucionResponse> {
    await this.institutionsService.restore(id);
    return {
      success: true,
      message: 'Institución educativa reactivada correctamente',
    };
  }
}
