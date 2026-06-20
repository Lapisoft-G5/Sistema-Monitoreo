import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MonitoringPlanService } from '../services/monitoring-plan.service.js';
import { CreatePlanDto } from '../dto/create-plan.dto.js';
import { QueryPlanDto } from '../dto/query-plan.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
import type { IMonitoringPlanResponse } from '@sistema-monitoreo/shared-contracts';

// Configuración de almacenamiento Multer
const storage = diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './uploads/planes';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `plan-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('planes-monitoreo')
@UseGuards(AuthGuard, PermissionsGuard)
export class MonitoringPlanController {
  constructor(private readonly service: MonitoringPlanService) {}

  @Post()
  @RequirePermissions('monitoreo:execute')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/i)) {
          return callback(new BadRequestException('Solo se permiten archivos en formato PDF.'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePlanDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<IMonitoringPlanResponse> {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio.');
    }
    const user = req.user;
    const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
    
    if (isDirector) {
      dto.tipoEntidad = 'IE';
    } else if (user?.role === 'jefe_gestion') {
      dto.tipoEntidad = 'UGEL';
    }

    // Generar la URL del archivo
    const fileUrl = `/uploads/planes/${file.filename}`;
    return this.service.create(dto, fileUrl);
  }

  @Get()
  @RequirePermissions('monitoreo:execute')
  async findAll(
    @Query() query: QueryPlanDto,
    @Req() req: any,
  ): Promise<IMonitoringPlanResponse[]> {
    const user = req.user;
    const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
    
    if (isDirector) {
      // Un director solo puede ver planes de tipo 'IE'
      query.tipoEntidad = 'IE';
    }
    
    return this.service.findAll(query);
  }

  @Delete(':id')
  @RequirePermissions('monitoreo:execute')
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<IMonitoringPlanResponse> {
    const user = req.user;
    const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
    
    if (isDirector) {
      // Un director solo puede eliminar planes de tipo 'IE'
      const plan = await this.service.findById(id);
      if (plan.tipoEntidad !== 'IE') {
        throw new ForbiddenException('No cuenta con permisos para eliminar este plan de monitoreo.');
      }
    }
    
    return this.service.delete(id);
  }
}
