import { CreateDocenteDto } from '../dto/create-docente.dto.js';
import { UpdateDocenteDto } from '../dto/update-docente.dto.js';

export interface DocenteEntity {
  id: string;
  personaId: string;
  institucionId: string;
  gradoAcademico: string | null;
  nivelEducativo: string;
  modalidad?: string | null;
  especialidad?: string | null;
  cursoAsignado: string | null;
  condicionLaboral?: string | null;
  escalaMagisterial?: number | null;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  persona: {
    id: string;
    dni: string;
    nombres: string;
    apellidos: string;
    correo: string | null;
    telefono: string | null;
  };
  docenteCargos: Array<{
    id: string;
    cargoId: string;
    fechaInicio: Date;
    fechaFin: Date | null;
    esPrincipal: boolean;
    cargo: {
      id: string;
      nombre: string;
    };
  }>;
  docenteSecciones?: Array<{
    id: string;
    grado: string;
    seccion: string;
  }>;
}

export interface DocenteFilter {
  institucionId?: string;
  especialistaNivel?: string;
}

export abstract class TeachersRepository {
  abstract findDocenteById(id: string): Promise<DocenteEntity | null>;
  abstract findDocentes(filter?: DocenteFilter): Promise<DocenteEntity[]>;
  abstract findPersonaByDni(dni: string): Promise<any>;
  abstract updateDocenteEstado(id: string, estado: string): Promise<DocenteEntity>;
  abstract bajaDirector(id: string): Promise<DocenteEntity>;
  abstract createDocenteWithTransaction(dto: CreateDocenteDto): Promise<DocenteEntity>;
  abstract updateDocenteWithTransaction(
    id: string,
    dto: UpdateDocenteDto,
    activeCargo: any,
    personaId: string,
  ): Promise<DocenteEntity>;
}
