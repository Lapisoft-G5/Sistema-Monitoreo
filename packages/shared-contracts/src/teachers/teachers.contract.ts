export interface ICreateDocenteRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  institucionId: string;
  gradoAcademico?: string;
  nivelEducativo: string;
  modalidad?: string;
  especialidad?: string;
  cursoAsignado?: string;
  cargoId: string;
  condicionLaboral?: string;
  cargaLaboral?: number;
  escalaMagisterial?: number;
  secciones?: { grado: string; seccion: string }[];
}

export interface IUpdateDocenteRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  gradoAcademico?: string;
  nivelEducativo: string;
  modalidad?: string;
  especialidad?: string;
  cursoAsignado?: string;
  cargoId: string;
  condicionLaboral?: string;
  cargaLaboral?: number;
  escalaMagisterial?: number;
  institucionId?: string;
  secciones?: { grado: string; seccion: string }[];
}

export interface IDocenteResponse {
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
  createdAt: Date | string;
  updatedAt: Date | string;
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
    fechaInicio: Date | string;
    fechaFin: Date | string | null;
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
