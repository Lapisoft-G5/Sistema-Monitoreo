import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { JwtPayload } from '../../auth/services/auth-token.service.js';

export abstract class InstitutionsRepository {
  abstract create(data: CreateInstitucionDto): Promise<Institucion>;
  abstract findById(id: string): Promise<Institucion | null>;
  abstract findByCodigoModular(codigoModular: string): Promise<Institucion | null>;
  abstract update(id: string, data: UpdateInstitucionDto): Promise<Institucion>;
  abstract softDelete(id: string): Promise<Institucion>;
  abstract restore(id: string): Promise<Institucion>;
  abstract findAll(
    query: QueryInstitucionDto,
    user?: JwtPayload,
  ): Promise<{ data: Institucion[]; total: number }>;
  abstract getDashboardStats(user?: JwtPayload): Promise<any>;
}
