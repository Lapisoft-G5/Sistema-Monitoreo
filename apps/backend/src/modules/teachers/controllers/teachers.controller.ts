import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeachersService } from '../services/teachers.service.js';
import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import { Request } from 'express';
import { JwtPayload } from '../../auth/services/auth-token.service.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('docentes')
@UseGuards(AuthGuard, PermissionsGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @RequirePermissions('docentes:write')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDocenteDto, @Req() req: AuthenticatedRequest) {
    return this.teachersService.createDocente(dto, req.user);
  }

  @Get()
  @RequirePermissions('docentes:read')
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.teachersService.getDocentes(req.user);
  }

  @Put(':id')
  @RequirePermissions('docentes:write')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocenteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.teachersService.updateDocente(id, dto, req.user);
  }

  @Patch(':id/baja')
  @RequirePermissions('docentes:write')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.teachersService.bajaDocente(id, req.user);
  }
}
