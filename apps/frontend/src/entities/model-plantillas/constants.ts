import type { Baremo, NivelCalificacion, NivelRomano } from './model';

export const TIPOS_MONITOREO = ['Monitoreo Docente', 'Monitoreo Directivo'] as const;

export const BAREMOS: { value: Baremo; label: string }[] = [
  { value: 'Vigente', label: 'Vigente (0-20)' },
  { value: 'Porcentual', label: 'Porcentual (%)' },
];

export const NIVELES_ROMANOS: NivelRomano[] = ['I', 'II', 'III', 'IV'];

// Niveles por defecto de la escala (como en el mockup).
export const NIVELES_DEFAULT: NivelCalificacion[] = [
  { nivel: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444' },
  { nivel: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b' },
  { nivel: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e' },
  { nivel: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6' },
];
