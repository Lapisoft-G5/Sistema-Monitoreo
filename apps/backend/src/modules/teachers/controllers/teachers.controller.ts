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
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RoleCode } from '../../../common/enums/role.enum.js';

@Controller('docentes')
@UseGuards(AuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(RoleCode.DIRECTOR_INSTITUCION, RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDocenteDto, @Req() req: any) {
    return this.teachersService.createDocente(dto, req.user);
  }

  @Get()
  @Roles(RoleCode.DIRECTOR_INSTITUCION, RoleCode.JEFE_AREA, RoleCode.DIRECTOR_UGEL)
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: any) {
    return this.teachersService.getDocentes(req.user);
  }

  @Put(':id')
  @Roles(RoleCode.DIRECTOR_INSTITUCION, RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateDocenteDto, @Req() req: any) {
    return this.teachersService.updateDocente(id, dto, req.user);
  }

  @Patch(':id/baja')
  @Roles(RoleCode.DIRECTOR_INSTITUCION, RoleCode.JEFE_AREA)
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string, @Req() req: any) {
    return this.teachersService.bajaDocente(id, req.user);
  }
}
