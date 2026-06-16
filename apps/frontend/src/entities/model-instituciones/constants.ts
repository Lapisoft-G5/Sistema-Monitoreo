import {
  NivelEducativoEBR,
  NivelEducativoEBA,
  NivelEducativoEBE,
  NivelEducativoCEPTRO,
  MODALIDAD_NIVEL_MAP,
} from '@sistema-monitoreo/shared-contracts';

import type { Nivel, EstadoInstitucion } from './model';

export type { Nivel, EstadoInstitucion };
export { MODALIDAD_NIVEL_MAP };

export const NIVELES: string[] = [
  ...Object.values(NivelEducativoEBR),
  ...Object.values(NivelEducativoEBA),
  ...Object.values(NivelEducativoEBE),
  ...Object.values(NivelEducativoCEPTRO),
];

export const NIVEL_LABEL: Record<string, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
  ...Object.fromEntries(NIVELES.map((n) => [n, n])),
  ...Object.fromEntries(NIVELES.map((n) => [n.toUpperCase(), n])),
};

export const ESTADOS: EstadoInstitucion[] = ['Activa', 'Inactiva'];

export const ZONAS = ['Urbana', 'Rural'];

export const PROVINCIAS = [
  'Puno',
  'Azángaro',
  'Carabaya',
  'Chucuito',
  'El Collao',
  'Huancané',
  'Lampa',
  'Melgar',
  'Moho',
  'San Antonio de Putina',
  'San Román',
  'Sandia',
  'Yunguyo',
];

export const DISTRITOS_LAMPA = [
  'Cabanilla',
  'Calapuja',
  'Lampa',
  'Nicasio',
  'Ocuviri',
  'Palca',
  'Paratía',
  'Pucará',
  'Santa Lucía',
  'Vilavila',
];

export const NIVEL_STYLE: Record<string, { bg: string; color: string }> = {
  INICIAL: { bg: '#fae8ff', color: '#a21caf' },
  PRIMARIA: { bg: '#dbeafe', color: '#1d4ed8' },
  SECUNDARIA: { bg: '#dcfce7', color: '#15803d' },
  Inicial: { bg: '#fae8ff', color: '#a21caf' },
  Primaria: { bg: '#dbeafe', color: '#1d4ed8' },
  Secundaria: { bg: '#dcfce7', color: '#15803d' },
};

export const ESTADO_COLOR: Record<EstadoInstitucion, string> = {
  Activa: '#22c55e',
  Inactiva: '#ef4444',
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};
