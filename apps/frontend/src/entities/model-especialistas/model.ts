export type EspecialistaRol =
  | 'especialista_admin'
  | 'especialista_medio'
  | 'especialista_bajo';

export type NivelInstitucion =
  | 'Inicial'
  | 'Primaria'
  | 'Secundaria';

export interface Especialista {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  celular: string;
  especialidad?: string;
  rol: EspecialistaRol;
  niveles: NivelInstitucion[];
  activo: boolean;
  fechaCreacion: string;
  cargaLaboral?: number;
}
