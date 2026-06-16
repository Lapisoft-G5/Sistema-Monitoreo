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
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CargoEspecialista } from '@sistema-monitoreo/shared-contracts';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
let EspecialistaService = class EspecialistaService {
  repository;
  catalogsRepository;
  constructor(repository, catalogsRepository) {
    this.repository = repository;
    this.catalogsRepository = catalogsRepository;
  }
  async findAll(filters) {
    return this.repository.findAll(filters);
  }
  async findById(id) {
    return this.repository.findById(id);
  }
  async create(dto, currentUser) {
    if (dto.cargo === CargoNombre.JEFE_GESTION) {
      if (currentUser.role !== RoleCode.DIRECTOR_UGEL && currentUser.role !== RoleCode.JEFE_AREA) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para crear un perfil de Jefe de Gestión.',
        );
      }
    }
    if (
      dto.cargo === CargoNombre.JEFE_GESTION &&
      dto.condicionLaboral !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }
    if (
      dto.cargo === CargoNombre.JEFE_AREA &&
      dto.cargaLaboral !== undefined &&
      dto.cargaLaboral !== 40
    ) {
      throw new BadRequestException(
        'La carga laboral de un Jefe de Área debe ser exactamente 40 horas.',
      );
    }
    if (
      dto.cargo === CargoNombre.ESPECIALISTA &&
      dto.nivelEducativo === 'Secundaria' &&
      (!dto.especialidad || dto.especialidad.trim() === '')
    ) {
      throw new BadRequestException(
        'Para un Especialista de nivel Secundaria, la especialidad es obligatoria.',
      );
    }
    const existingPersona = await this.catalogsRepository.findPersonaByDni(dto.dni);
    if (existingPersona) {
      throw new ConflictException(
        `La persona con DNI ${dto.dni} ya está registrada en el sistema.`,
      );
    }
    const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
    if (!role) {
      throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
    }
    if (dto.cargo === CargoNombre.JEFE_GESTION) {
      dto.condicionLaboral = CondicionLaboral.NOMBRADO;
    }
    if (dto.cargo === CargoNombre.JEFE_AREA) {
      dto.cargaLaboral = 40;
    }
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
    return this.repository.create(dto, passwordHash, role.id);
  }
  async update(id, dto, currentUser) {
    if (dto.cargo === CargoNombre.JEFE_GESTION) {
      if (currentUser.role !== RoleCode.DIRECTOR_UGEL && currentUser.role !== RoleCode.JEFE_AREA) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para actualizar un perfil de Jefe de Gestión.',
        );
      }
    }
    if (
      dto.cargo === CargoNombre.JEFE_GESTION &&
      dto.condicionLaboral !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }
    if (
      dto.cargo === CargoNombre.JEFE_AREA &&
      dto.cargaLaboral !== undefined &&
      dto.cargaLaboral !== 40
    ) {
      throw new BadRequestException(
        'La carga laboral de un Jefe de Área debe ser exactamente 40 horas.',
      );
    }
    if (
      dto.cargo === CargoNombre.ESPECIALISTA &&
      dto.nivelEducativo === 'Secundaria' &&
      (!dto.especialidad || dto.especialidad.trim() === '')
    ) {
      throw new BadRequestException(
        'Para un Especialista de nivel Secundaria, la especialidad es obligatoria.',
      );
    }
    if (dto.cargo === CargoNombre.JEFE_GESTION) {
      dto.condicionLaboral = CondicionLaboral.NOMBRADO;
    }
    if (dto.cargo === CargoNombre.JEFE_AREA) {
      dto.cargaLaboral = 40;
    }
    let roleId;
    if (dto.rolCode) {
      const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
      if (!role) {
        throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
      }
      roleId = role.id;
    }
    return this.repository.update(id, dto, roleId);
  }
  async delete(id) {
    return this.repository.delete(id);
  }
  async activate(id) {
    return this.repository.activate(id);
  }
  async deactivate(id) {
    return this.repository.deactivate(id);
  }
};
EspecialistaService = __decorate(
  [Injectable(), __metadata('design:paramtypes', [EspecialistaRepository, CatalogsRepository])],
  EspecialistaService,
);
export { EspecialistaService };
export { CargoEspecialista };
//# sourceMappingURL=especialista.service.js.map
