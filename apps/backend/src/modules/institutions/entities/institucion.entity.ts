import { BaseEntity } from '../../../shared/types/base.entity.js';

export class Institucion extends BaseEntity {
  codigoModular!: string;
  codigoLocal!: string;
  nombre!: string;
  nivelEducativo!: string;
  departamento!: string;
  provincia!: string;
  distrito!: string;
  direccion!: string;
  zona!: string;
  estado!: string;
  modalidad!: string | null;
  nivelEducativoId?: string | null;
  director?: string | null;
  directorTelefono?: string | null;
  directorCorreo?: string | null;
  directorDni?: string | null;
}
