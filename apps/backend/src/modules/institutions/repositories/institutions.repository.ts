import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { QueryInstitucionDto } from '../dto/query-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';

export abstract class InstitutionsRepository {
  abstract create(data: CreateInstitucionDto): Promise<Institucion>;
  abstract findById(id: string): Promise<Institucion | null>;
  abstract findByCodigoModular(codigoModular: string): Promise<Institucion | null>;
  abstract update(id: string, data: UpdateInstitucionDto): Promise<Institucion>;
  abstract softDelete(id: string): Promise<Institucion>;
  abstract restore(id: string): Promise<Institucion>;
  abstract findAll(query: QueryInstitucionDto): Promise<{ data: Institucion[]; total: number }>;
}
