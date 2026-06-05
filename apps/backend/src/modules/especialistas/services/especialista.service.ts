import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EspecialistaRepository } from '../repositories/especialista.repository.js';
import { CreateEspecialistaDto } from '../dto/create-especialista.dto.js';
import { UpdateEspecialistaDto } from '../dto/update-especialista.dto.js';
import { QueryEspecialistaDto } from '../dto/query-especialista.dto.js';
import type { IEspecialistaResponse } from '@sistema-monitoreo/shared-contracts';

@Injectable()
export class EspecialistaService {
  constructor(private readonly repository: EspecialistaRepository) {}

  async findAll(filters?: QueryEspecialistaDto): Promise<IEspecialistaResponse[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string): Promise<IEspecialistaResponse | null> {
    return this.repository.findById(id);
  }

  async create(dto: CreateEspecialistaDto): Promise<IEspecialistaResponse> {
    // La contraseña por defecto para el primer login será el propio DNI
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.dni, saltRounds);
    return this.repository.create(dto, passwordHash);
  }

  async update(id: string, dto: UpdateEspecialistaDto): Promise<IEspecialistaResponse> {
    return this.repository.update(id, dto);
  }

  async delete(id: string): Promise<IEspecialistaResponse> {
    return this.repository.delete(id);
  }
}
