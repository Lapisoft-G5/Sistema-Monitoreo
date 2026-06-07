import type { Nivel, EstadoMonitoreo } from './model';

export type { Nivel, EstadoMonitoreo };

export const NIVELES: Nivel[] = ['INICIAL', 'PRONOEI', 'PRIMARIA', 'SECUNDARIA'];

export const NIVEL_LABEL: Record<Nivel, string> = {
  INICIAL: 'Inicial',
  PRONOEI: 'PRONOEI',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
};

export const ESTADOS: EstadoMonitoreo[] = ['Satisfactorio', 'En Proceso', 'Crítico'];

export const ZONAS = ['Urbana', 'Rural'];

export const PROVINCIAS = [
  'Puno', 'Azángaro', 'Carabaya', 'Chucuito', 'El Collao',
  'Huancané', 'Lampa', 'Melgar', 'Moho', 'San Antonio de Putina',
  'San Román', 'Sandia', 'Yunguyo',
];

export const DISTRITOS_LAMPA = [
  'Cabanilla', 'Calapuja', 'Lampa', 'Nicasio', 'Ocuviri',
  'Palca', 'Paratía', 'Pucará', 'Santa Lucía', 'Vilavila',
];

export const NIVEL_STYLE: Record<Nivel, { bg: string; color: string }> = {
  INICIAL: { bg: '#fae8ff', color: '#a21caf' },
  PRONOEI: { bg: '#fef9c3', color: '#a16207' },
  PRIMARIA: { bg: '#dbeafe', color: '#1d4ed8' },
  SECUNDARIA: { bg: '#dcfce7', color: '#15803d' },
};

export const ESTADO_COLOR: Record<EstadoMonitoreo, string> = {
  Satisfactorio: '#22c55e',
  'En Proceso': '#f97316',
  Crítico: '#ef4444',
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};