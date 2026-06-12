export interface IJefeAreaResponse {
  id: string;
  personaId: string;
  cargaHoraria: number;
  nivelEducativo: string;
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
  user?: {
    id: string;
    role: {
      code: string;
      name: string;
    };
  };
}

export interface IQueryJefeAreaRequest {
  estado?: string;
  nivelEducativo?: string;
}

export interface ICreateJefeAreaRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargaHoraria: number;
  nivelEducativo: string;
  rolCode: string;
}

export interface IUpdateJefeAreaRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargaHoraria: number;
  nivelEducativo: string;
  estado: string;
  rolCode: string;
}
