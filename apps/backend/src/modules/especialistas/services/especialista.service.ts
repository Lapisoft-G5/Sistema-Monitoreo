import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';
import { CargoNombre } from '../../../common/enums/cargo.enum.js';
import { CondicionLaboral } from '../../../common/enums/condicion-laboral.enum.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { JwtPayload } from '../../auth/services/auth-token.service.js';

@Injectable()
export class EspecialistaService {
  constructor(
    private readonly repository: EspecialistaRepository,
    private readonly catalogsRepository: CatalogsRepository,
  ) {}

  async findAll(filters?: QueryEspecialistaDto): Promise<IEspecialistaResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    return this.repository.findById(id);
  }

  async create(
    dto: CreateEspecialistaDto,
    currentUser: JwtPayload,
  ): Promise<IEspecialistaResponse> {
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      if (
        (currentUser.role as RoleCode) !== RoleCode.DIRECTOR_UGEL &&
        (currentUser.role as RoleCode) !== RoleCode.JEFE_AREA
      ) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para crear un perfil de Jefe de Gestión.',
        );
      }
    }

    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION &&
      (dto.condicionLaboral as CondicionLaboral) !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }

    const existingPersona = await this.catalogsRepository.findPersonaByDni(dto.dni);
    if (existingPersona) {
      throw new ConflictException(
        `La persona con DNI ${dto.dni} ya está registrada en el sistema.`,
      );
    }

    // El especialista necesita el ID del rol por código
    const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
    if (!role) {
      throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
    return this.repository.create(dto, passwordHash, role.id);
  }

  async update(
    id: string,
    dto: UpdateEspecialistaDto,
    currentUser: JwtPayload,
  ): Promise<IEspecialistaResponse> {
    if ((dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION) {
      if (
        (currentUser.role as RoleCode) !== RoleCode.DIRECTOR_UGEL &&
        (currentUser.role as RoleCode) !== RoleCode.JEFE_AREA
      ) {
        throw new ForbiddenException(
          'No tiene privilegios suficientes para actualizar un perfil de Jefe de Gestión.',
        );
      }
    }

    if (
      (dto.cargo as CargoNombre) === CargoNombre.JEFE_GESTION &&
      (dto.condicionLaboral as CondicionLaboral) !== CondicionLaboral.NOMBRADO
    ) {
      throw new BadRequestException(
        'La condición laboral de un Jefe de Gestión debe ser exactamente Nombrado.',
      );
    }

    let roleId: string | undefined;
    if (dto.rolCode) {
      const role = await this.catalogsRepository.findRoleByCode(dto.rolCode);
      if (!role) {
        throw new NotFoundException(`El rol ${dto.rolCode} no existe.`);
      }
      roleId = role.id;
    }
    return this.repository.update(id, dto, roleId);
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    return this.repository.delete(id);
  }
}
