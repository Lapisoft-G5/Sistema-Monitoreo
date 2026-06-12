export class Institucion {
  id!: string;
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
  createdAt!: Date;
  updatedAt!: Date;
}
