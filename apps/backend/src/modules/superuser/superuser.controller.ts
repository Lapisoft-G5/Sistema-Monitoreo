import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperuserService } from './superuser.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@Controller('superadmin')
@UseGuards(AuthGuard, PermissionsGuard)
export class SuperuserController {
  constructor(private readonly superuserService: SuperuserService) {}

  @Get('candidatos')
  @RequirePermissions('superadmin:access')
  @HttpCode(HttpStatus.OK)
  async getCandidatos() {
    return this.superuserService.getCandidatos();
  }

  @Patch('asignar-rol/:id')
  @RequirePermissions('superadmin:access')
  @HttpCode(HttpStatus.OK)
  async asignarRol(@Param('id') id: string, @Body('role') role: string) {
    return this.superuserService.asignarRol(id, role);
  }
}
