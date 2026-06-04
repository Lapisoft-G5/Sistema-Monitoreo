import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InstitutionsRepository } from '../repositories/institutions.repository.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';

@Injectable()
export class InstitutionsService {
  constructor(private readonly institutionsRepository: InstitutionsRepository) {}

  async create(dto: CreateInstitucionDto): Promise<Institucion> {
    const existing = await this.institutionsRepository.findByCodigoModular(dto.codigoModular);
    if (existing) {
      throw new ConflictException(`La institución con código modular ${dto.codigoModular} ya existe en el sistema.`);
    }
    return this.institutionsRepository.create(dto);
  }

  async findById(id: string): Promise<Institucion> {
    const record = await this.institutionsRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Institución educativa con ID ${id} no encontrada.`);
    }
    return record;
  }

  async update(id: string, dto: UpdateInstitucionDto): Promise<Institucion> {
    await this.findById(id); // Valida existencia (lanza 404 si no existe)
    return this.institutionsRepository.update(id, dto);
  }

  async softDelete(id: string): Promise<Institucion> {
    await this.findById(id); // Valida existencia (lanza 404 si no existe)
    return this.institutionsRepository.softDelete(id);
  }

  async findAll(query: QueryInstitucionDto): Promise<{ data: Institucion[]; total: number; limit: number; offset: number }> {
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    
    const { data, total } = await this.institutionsRepository.findAll({
      ...query,
      limit,
      offset,
    });

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
