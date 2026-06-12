export type Nivel = 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
export type EstadoMonitoreo = 'Satisfactorio' | 'En Proceso' | 'Crítico';

export interface Institucion {
  id: string;
  codigoModular: string;
  codigoLocal: string;
  nombre: string;
  direccion: string;
  nivel: Nivel;
  distrito: string;
  director: string | null; // null = sin asignar
  estado: EstadoMonitoreo;
  provincia?: string;
  zona?: string;
  directorTelefono?: string;
  directorCorreo?: string;
  modalidad?: string;
}