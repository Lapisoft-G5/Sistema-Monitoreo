export interface ICreateInstitucionRequest {
  codigoModular: string;
  nombre: string;
  nivelEducativo: string;
  departamento?: string;
  provincia: string;
  distrito: string;
  direccion: string;
  zona: string;
  estado?: string;
}

export interface IInstitucionResponse {
  id: string;
  codigoModular: string;
  nombre: string;
  nivelEducativo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  zona: string;
  estado: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
