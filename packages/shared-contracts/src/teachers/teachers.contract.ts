export interface ICreateDocenteRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  institucionId: string;
  gradoAcademico?: string;
  nivelEducativo: string;
  cursoAsignado?: string;
  cargoId: string;
  condicionLaboral?: string;
  escalaMagisterial?: number;
}

export interface IUpdateDocenteRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  gradoAcademico?: string;
  nivelEducativo: string;
  cursoAsignado?: string;
  cargoId: string;
  condicionLaboral?: string;
  escalaMagisterial?: number;
}

export interface IDocenteResponse {
  id: string;
  personaId: string;
  institucionId: string;
  gradoAcademico: string | null;
  nivelEducativo: string;
  cursoAsignado: string | null;
  condicionLaboral?: string | null;
  escalaMagisterial?: number | null;
  estado: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
    fechaInicio: Date | string;
    fechaFin: Date | string | null;
    cargo: {
      id: string;
      nombre: string;
    };
  }>;
}

export interface IBajaDocenteResponse {
  success: boolean;
  message: string;
  docente: {
    id: string;
    estado: string;
    persona: {
      dni: string;
      nombres: string;
      apellidos: string;
    };
  };
}
