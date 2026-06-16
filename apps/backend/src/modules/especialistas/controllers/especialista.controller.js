var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
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
  Req,
} from '@nestjs/common';
import { EspecialistaService } from '../services/especialista.service.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator.js';
let EspecialistaController = class EspecialistaController {
  service;
  constructor(service) {
    this.service = service;
  }
  async findAll(query) {
    return this.service.findAll(query);
  }
  async findById(id) {
    return this.service.findById(id);
  }
  async create(dto, req) {
    return this.service.create(dto, req.user);
  }
  async update(id, dto, req) {
    return this.service.update(id, dto, req.user);
  }
  async delete(id) {
    return this.service.delete(id);
  }
  async activate(id) {
    return this.service.activate(id);
  }
  async deactivate(id) {
    return this.service.deactivate(id);
  }
};
__decorate(
  [
    Get(),
    RequirePermissions('especialistas:read'),
    __param(0, Query()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [QueryEspecialistaDto]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'findAll',
  null,
);
__decorate(
  [
    Get(':id'),
    RequirePermissions('especialistas:read'),
    __param(0, Param('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'findById',
  null,
);
__decorate(
  [
    Post(),
    RequirePermissions('especialistas:write'),
    HttpCode(HttpStatus.CREATED),
    __param(0, Body()),
    __param(1, Req()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [CreateEspecialistaDto, Object]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'create',
  null,
);
__decorate(
  [
    Put(':id'),
    RequirePermissions('especialistas:write'),
    HttpCode(HttpStatus.OK),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, UpdateEspecialistaDto, Object]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'update',
  null,
);
__decorate(
  [
    Delete(':id'),
    RequirePermissions('especialistas:write'),
    HttpCode(HttpStatus.OK),
    __param(0, Param('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'delete',
  null,
);
__decorate(
  [
    Patch(':id/alta'),
    RequirePermissions('especialistas:write'),
    HttpCode(HttpStatus.OK),
    __param(0, Param('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'activate',
  null,
);
__decorate(
  [
    Patch(':id/baja'),
    RequirePermissions('especialistas:write'),
    HttpCode(HttpStatus.OK),
    __param(0, Param('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  EspecialistaController.prototype,
  'deactivate',
  null,
);
EspecialistaController = __decorate(
  [
    Controller('especialistas'),
    UseGuards(AuthGuard, PermissionsGuard),
    __metadata('design:paramtypes', [EspecialistaService]),
  ],
  EspecialistaController,
);
export { EspecialistaController };
//# sourceMappingURL=especialista.controller.js.map
