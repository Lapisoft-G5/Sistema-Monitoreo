import { BaseEntity } from '../../../shared/types/base.entity.js';

export class Persona extends BaseEntity {
  dni!: string;
  nombres!: string;
  apellidos!: string;
  correo: string | null = null;
  telefono: string | null = null;
  docente?: {
    id: string;
    institucionId: string;
    gradoAcademico: string | null;
    nivelEducativoId: string;
    estado: string;
  } | null = null;
  especialista?: {
    id: string;
    cargo: string;
    nivelEducativoId: string;
    condicionLaboral: string;
    cargaLaboral: number;
    estado: string;
    modalidad: string | null;
  } | null = null;
}
