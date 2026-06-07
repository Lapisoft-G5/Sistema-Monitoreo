import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { EspecialistaService } from '../services/especialista.service.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

@Controller('especialistas')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleCode.COORDINADOR_PEDAGOGICO)
export class EspecialistaController {
  constructor(private readonly service: EspecialistaService) {}

  @Get()
  async findAll(@Query() query: QueryEspecialistaDto): Promise<IEspecialistaResponse[]> {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<IEspecialistaResponse | null> {
    return this.service.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEspecialistaDto): Promise<IEspecialistaResponse> {
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEspecialistaDto,
  ): Promise<IEspecialistaResponse> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<IEspecialistaResponse> {
    return this.service.delete(id);
  }
}
