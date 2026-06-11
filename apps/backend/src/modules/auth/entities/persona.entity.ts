export class Persona {
  id!: string;
  dni!: string;
  nombres!: string;
  apellidos!: string;
  correo!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  docente?: {
    id: string;
    institucionId: string;
    gradoAcademico: string | null;
    nivelEducativo: string;
    estado: string;
  } | null;
}
