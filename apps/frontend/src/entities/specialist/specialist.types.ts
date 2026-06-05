export type EspecialistaRol =
  | 'especialista_admin'
  | 'especialista_medio'
  | 'especialista_bajo';

export type NivelInstitucion =
  | 'Inicial'
  | 'Primaria'
  | 'Secundaria'
  | 'EBA'
  | 'EBE'
  | 'CEPROs';

export interface Especialista {
  id: string;
  nombres: string;
  dni: string;
  correo: string;
  celular: string;
  especialidad: string;
  rol: EspecialistaRol;
  niveles: NivelInstitucion[];
  activo: boolean;
  fechaCreacion: string;
}

export const ROL_ESPECIALISTA_LABELS: Record<EspecialistaRol, string> = {
  especialista_admin: 'Especialista Admin',
  especialista_medio: 'Especialista Medio',
  especialista_bajo:  'Especialista Bajo',
};

export const NIVELES_INSTITUCION: NivelInstitucion[] = [
  'Inicial', 'Primaria', 'Secundaria', 'EBA', 'EBE', 'CEPROs',
];