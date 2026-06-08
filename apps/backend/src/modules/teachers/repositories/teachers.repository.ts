import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';

export interface DocenteEntity {
  id: string;
  personaId: string;
  institucionId: string;
  gradoAcademico: string | null;
  nivelEducativo: string;
  cursoAsignado: string | null;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  persona: {
    id: string;
    dni: string;
    nombres: string;
    apellidos: string;
    correo: string | null;
  };
  docenteCargos: Array<{
    id: string;
    cargoId: string;
    fechaInicio: Date;
    fechaFin: Date | null;
    cargo: {
      id: string;
      nombre: string;
    };
  }>;
}

export interface DocenteFilter {
  institucionId?: string;
}

export abstract class TeachersRepository {
  abstract findDocenteById(id: string): Promise<DocenteEntity | null>;
  abstract findDocentes(filter?: DocenteFilter): Promise<DocenteEntity[]>;
  abstract updateDocenteEstado(id: string, estado: string): Promise<DocenteEntity>;
  abstract createDocenteWithTransaction(dto: CreateDocenteDto): Promise<DocenteEntity>;
  abstract updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: any,
    personaId: string,
  ): Promise<DocenteEntity>;
}
