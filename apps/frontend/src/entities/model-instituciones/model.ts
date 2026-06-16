export type Nivel = string;
export type EstadoInstitucion = 'Activa' | 'Inactiva';

export interface Institucion {
  id: string;
  codigoModular: string;
  codigoLocal: string;
  nombre: string;
  direccion: string;
  nivel: Nivel;
  distrito: string;
  director: string | null; // null = sin asignar
  estado: EstadoInstitucion;
  provincia?: string;
  zona?: string;
  directorTelefono?: string;
  directorCorreo?: string;
  directorDni?: string;
  modalidad?: string;
  activo?: boolean;
}