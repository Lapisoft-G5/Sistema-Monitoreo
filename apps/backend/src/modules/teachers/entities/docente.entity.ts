import { BaseEntity } from '../../../shared/types/base.entity.js';

export class Docente extends BaseEntity {
  personaId!: string;
  institucionId!: string;
  gradoAcademico: string | null = null;
  nivelEducativo!: string;
  nivelEducativoId: string | null = null;
  escalaMagisterial: number | null = null;
  condicionLaboral: string | null = null;
  estado!: string;
  modalidad: string | null = null;
  cargaLaboral: number | null = null;
}
