import { BaseEntity } from '../../../shared/types/base.entity.js';

export class Especialista extends BaseEntity {
  personaId!: string;
  cargo!: string;
  nivelEducativo!: string;
  condicionLaboral!: string;
  cargaLaboral!: number;
  estado!: string;
  modalidad: string | null = null;
  escalaMagisterial: number | null = null;
}
