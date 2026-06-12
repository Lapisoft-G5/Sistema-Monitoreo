import type { Nivel, EstadoInstitucion } from './model';

export type { Nivel, EstadoInstitucion };

export const NIVELES: Nivel[] = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'];

export const NIVEL_LABEL: Record<Nivel, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
};

export const ESTADOS: EstadoInstitucion[] = ['Activa', 'Inactiva'];

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
  PRIMARIA: { bg: '#dbeafe', color: '#1d4ed8' },
  SECUNDARIA: { bg: '#dcfce7', color: '#15803d' },
};

export const ESTADO_COLOR: Record<EstadoInstitucion, string> = {
  Activa: '#22c55e',
  Inactiva: '#ef4444',
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};