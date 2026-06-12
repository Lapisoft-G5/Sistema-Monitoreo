import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JefeAreaRepository } from '../repositories/jefe-area.repository.js';
import { CreateJefeAreaDto } from '../dto/create-jefe-area.dto.js';
import { UpdateJefeAreaDto } from '../dto/update-jefe-area.dto.js';
import { QueryJefeAreaDto } from '../dto/query-jefe-area.dto.js';
import type { IJefeAreaResponse } from '@sistema-monitoreo/shared-contracts';
import { CatalogsRepository } from '../../catalogs/repositories/catalogs.repository.js';

@Injectable()
export class JefeAreaService {
  constructor(
    private readonly repository: JefeAreaRepository,
    private readonly catalogsRepository: CatalogsRepository,
  ) {}

  async findAll(filters?: QueryJefeAreaDto): Promise<IJefeAreaResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string): Promise<IJefeAreaResponse | null> {
    return this.repository.findById(id);
  }

  async create(
    dto: CreateJefeAreaDto,
  ): Promise<IJefeAreaResponse> {
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

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
    return this.repository.create(dto, passwordHash, role.id);
  }

  async update(
    id: string,
    dto: UpdateJefeAreaDto,
  ): Promise<IJefeAreaResponse> {
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

  async delete(id: string): Promise<IJefeAreaResponse> {
    return this.repository.delete(id);
  }

  async activate(id: string): Promise<IJefeAreaResponse> {
    return this.repository.activate(id);
  }

  async deactivate(id: string): Promise<IJefeAreaResponse> {
    return this.repository.deactivate(id);
  }
}
