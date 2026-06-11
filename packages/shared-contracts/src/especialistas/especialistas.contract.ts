export interface IEspecialistaResponse {
  id: string;
  personaId: string;
  especialidad: string;
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
  };
  user?: {
    id: string;
    role: {
      code: string;
      name: string;
    };
  };
}

export interface IQueryEspecialistaRequest {
  estado?: string;
  especialidad?: string;
  nivelEducativo?: string;
}

export interface ICreateEspecialistaRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  especialidad: string;
  nivelEducativo: string;
  rolCode: string;
  cargo?: string;
  condicionLaboral?: string;
}

export interface IUpdateEspecialistaRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  especialidad: string;
  nivelEducativo: string;
  estado: string;
  rolCode: string;
  cargo?: string;
  condicionLaboral?: string;
}
