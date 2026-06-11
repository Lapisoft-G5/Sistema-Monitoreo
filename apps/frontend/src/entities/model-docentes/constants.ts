import type { CondicionDirectiva, CondicionLaboral, EscalaMagisterial } from './model';

export const CONDICION_LABORAL: CondicionLaboral[] = ['Nombrado', 'Contratado'];

export const CONDICION_DIRECTIVA: CondicionDirectiva[] = ['Asignado', 'Encargado', 'Por función'];

export const CONDICION_DIRECTIVA_COLOR: Record<CondicionDirectiva, string> = {
  Asignado: '#22c55e', // Verde
  Encargado: '#f59e0b', // Ámbar
  'Por función': '#3b82f6', // Azul
};

export const ESCALAS_MAGISTERIALES: { value: EscalaMagisterial; label: string }[] = [
  { value: 'I', label: 'I — Primera Escala' },
  { value: 'II', label: 'II — Segunda Escala' },
  { value: 'III', label: 'III — Tercera Escala' },
  { value: 'IV', label: 'IV — Cuarta Escala' },
  { value: 'V', label: 'V — Quinta Escala' },
  { value: 'VI', label: 'VI — Sexta Escala' },
  { value: 'VII', label: 'VII — Séptima Escala' },
  { value: 'VIII', label: 'VIII — Octava Escala' },
];

export const CARGOS = ['Director', 'Coordinador Pedagógico', 'Docente de Aula'] as const;
export type CargoDocente = (typeof CARGOS)[number];

export const CARGO_COLOR: Record<CargoDocente, string> = {
  Director: '#22c55e', // Green
  'Coordinador Pedagógico': '#3b82f6', // Blue
  'Docente de Aula': '#6b7280', // Gray
};
