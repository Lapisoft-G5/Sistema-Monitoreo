export class Persona {
  id!: string;
  dni!: string;
  nombres!: string;
  apellidos!: string;
  correo: string | null = null;
  createdAt!: Date;
  updatedAt!: Date;
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
