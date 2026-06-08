import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';

export type DocenteWithRelations = Prisma.DocenteGetPayload<{
  include: { persona: true; docenteCargos: { include: { cargo: true } } };
}>;

export interface TeachersRepository {
  findDocenteById(id: string): Promise<DocenteWithRelations | null>;
  findDocentes(whereClause: Prisma.DocenteWhereInput): Promise<DocenteWithRelations[]>;
  updateDocenteEstado(id: string, estado: string): Promise<DocenteWithRelations>;

  createDocenteWithTransaction(dto: CreateDocenteDto): Promise<DocenteWithRelations>;
  updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: any,
    personaId: string,
  ): Promise<DocenteWithRelations>;
}

export const TeachersRepository = Symbol('TeachersRepository');
