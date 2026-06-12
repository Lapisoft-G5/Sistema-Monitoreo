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
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { JefeAreaService } from '../services/jefe-area.service.js';
import { CreateJefeAreaDto } from '../dto/create-jefe-area.dto.js';
import { UpdateJefeAreaDto } from '../dto/update-jefe-area.dto.js';
import { QueryJefeAreaDto } from '../dto/query-jefe-area.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import type { IJefeAreaResponse } from '@sistema-monitoreo/shared-contracts';

@Controller('jefes-area')
@UseGuards(AuthGuard, PermissionsGuard)
export class JefeAreaController {
  constructor(private readonly service: JefeAreaService) {}

  @Get()
  @RequirePermissions('jefes_area:write')
  async findAll(@Query() query: QueryJefeAreaDto): Promise<IJefeAreaResponse[]> {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('jefes_area:write')
  async findById(@Param('id') id: string): Promise<IJefeAreaResponse | null> {
    return this.service.findById(id);
  }

  @Post()
  @RequirePermissions('jefes_area:write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateJefeAreaDto,
  ): Promise<IJefeAreaResponse> {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermissions('jefes_area:write')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJefeAreaDto,
  ): Promise<IJefeAreaResponse> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('jefes_area:write')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<IJefeAreaResponse> {
    return this.service.delete(id);
  }

  @Patch(':id/alta')
  @RequirePermissions('jefes_area:write')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string): Promise<IJefeAreaResponse> {
    return this.service.activate(id);
  }

  @Patch(':id/baja')
  @RequirePermissions('jefes_area:write')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string): Promise<IJefeAreaResponse> {
    return this.service.deactivate(id);
  }
}
