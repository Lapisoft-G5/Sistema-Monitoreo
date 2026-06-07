import type { EspecialistaRol, NivelInstitucion } from './model';

export const ROL_ESPECIALISTA_LABELS: Record<EspecialistaRol, string> = {
  especialista_admin: 'Especialista General (UGEL)',
  especialista_medio: 'Especialista de Nivel',
  especialista_bajo:  'Especialista de Área',
};

export const NIVELES_INSTITUCION: NivelInstitucion[] = [
  'Inicial',
  'Primaria',
  'Secundaria',
  'EBA',
  'EBE',
  'CEPROs',
];

export const ROL_COLORS: Record<EspecialistaRol, string> = {
  especialista_admin: '#990537', // UGEL Primary Red
  especialista_medio: '#3b82f6', // Blue
  especialista_bajo:  '#22c55e', // Green
};
