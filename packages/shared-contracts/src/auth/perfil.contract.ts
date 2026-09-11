export interface IPerfilResponse {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  role: string;
  cargo?: string;
  institucion?: string;
  condicion?: string;
  escala?: string | number | null;
  nivelEducativo?: string | null;
}

export interface IUpdatePerfilRequest {
  correo?: string | null;
  telefono?: string | null;
}
