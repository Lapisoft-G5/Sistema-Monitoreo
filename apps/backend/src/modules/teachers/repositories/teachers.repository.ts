import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';

export interface TeachersRepository {
  findInstitucionById(id: string): Promise<any>;
  findCargoById(id: string): Promise<any>;
  findDocenteById(id: string): Promise<any>;
  findDocentes(whereClause: any): Promise<any[]>;
  findPersonaByEmailNotId(email: string, excludePersonaId: string): Promise<any>;
  updateDocenteEstado(id: string, estado: string): Promise<any>;
  
  createDocenteWithTransaction(dto: CreateDocenteDto): Promise<any>;
  updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: any,
    personaId: string,
  ): Promise<any>;
}

export const TeachersRepository = Symbol('TeachersRepository');
