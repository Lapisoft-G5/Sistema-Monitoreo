import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { ScopeFilter } from '../../../shared/auth/scope-filter.js';
import { InstitutionsRepository } from './institutions.repository.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { JwtPayload } from '../../auth/services/auth-token.service.js';
import { findAll, findById, findByCodigoModular } from './institucion-read.helper.js';
import { create, update } from './institucion-write.helper.js';
import { softDelete, restore } from './institucion-state.helper.js';

@Injectable()
export class PrismaInstitutionsRepository implements InstitutionsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeFilter: ScopeFilter,
  ) {}

  async create(data: CreateInstitucionDto): Promise<Institucion> {
    return create(this.prisma, data);
  }

  async findById(id: string): Promise<Institucion | null> {
    return findById(this.prisma, id);
  }

  async findByCodigoModular(codigoModular: string): Promise<Institucion | null> {
    return findByCodigoModular(this.prisma, codigoModular);
  }

  async update(id: string, data: UpdateInstitucionDto): Promise<Institucion> {
    return update(this.prisma, id, data);
  }

  async softDelete(id: string): Promise<Institucion> {
    return softDelete(this.prisma, id);
  }

  async restore(id: string): Promise<Institucion> {
    return restore(this.prisma, id);
  }

  async findAll(
    query: QueryInstitucionDto,
    user?: JwtPayload,
  ): Promise<{ data: Institucion[]; total: number }> {
    return findAll(this.prisma, this.scopeFilter, query, user);
  }
}
