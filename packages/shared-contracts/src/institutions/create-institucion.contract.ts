export interface ICreateInstitucionRequest {
  codigoModular: string;
  codigoLocal: string;
  nombre: string;
  nivelEducativo: string;
  departamento?: string;
  provincia: string;
  distrito: string;
  direccion: string;
  zona: string;
  estado?: string;
  modalidad?: string | null;
  directorDni?: string | null;
}

export interface IInstitucionResponse {
  id: string;
  codigoModular: string;
  codigoLocal: string;
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
  modalidad?: string | null;
  director?: string | null;
  directorTelefono?: string | null;
  directorCorreo?: string | null;
  directorDni?: string | null;
}
