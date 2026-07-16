import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { InstitutionsService } from '../services/institutions.service.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import {
  IInstitucionResponse,
  IInstitucionListResponse,
  IUpdateInstitucionResponse,
} from '@sistema-monitoreo/shared-contracts';
import { JwtPayload } from '../../auth/services/auth-token.service.js';

@Controller('instituciones')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  /**
   * POST /api/instituciones
   * Registra una nueva Institución Educativa.
   * Valida código modular (7 dígitos). Conflicto (409) si ya existe.
   */
  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateInstitucionDto,
    @Req() req: { user?: JwtPayload },
  ): Promise<IInstitucionResponse> {
    return this.institutionsService.create(dto, req.user);
  }

  /**
   * GET /api/instituciones
   * Retorna listado de instituciones con filtros opcionales y paginación.
   */
  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:read')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryInstitucionDto,
    @Req() req: { user?: JwtPayload },
  ): Promise<IInstitucionListResponse> {
    return this.institutionsService.findAll(query, req.user);
  }

  /**
   * GET /api/instituciones/:id
   * Retorna una institución educativa específica por su ID.
   */
  @Get(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:read')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<IInstitucionResponse> {
    return this.institutionsService.findById(id);
  }

  /**
   * PUT /api/instituciones/:id
   * Actualiza los datos de una institución existente.
   * Descarta cualquier intento de modificar codigo_modular.
   */
  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:write')
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
   */
  @Patch(':id/baja')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:write')
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
   */
  @Patch(':id/alta')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:write')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string): Promise<IUpdateInstitucionResponse> {
    await this.institutionsService.restore(id);
    return {
      success: true,
      message: 'Institución educativa reactivada correctamente',
    };
  }

  /**
   * GET /api/instituciones/dashboard-stats
   * Obtiene los indicadores y KPIs de las instituciones para el dashboard.
   */
  @Get('dashboard/stats')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('instituciones:read')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Req() req: { user?: JwtPayload }) {
    return this.institutionsService.getDashboardStats(req.user);
  }
}
