import type { NivelInstitucion } from './model';

export const NIVELES_INSTITUCION: NivelInstitucion[] = [
  'Inicial',
  'Primaria',
  'Secundaria',
];

export const CARGO_COLORS: Record<string, string> = {
  'Jefe de Gestión': '#990537', // UGEL Primary Red
  'Especialista': '#3b82f6', // Blue
  'Jefe de Área': '#22c55e', // Green
};
