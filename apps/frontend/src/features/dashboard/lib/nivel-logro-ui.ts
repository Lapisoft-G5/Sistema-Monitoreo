import type { NivelLogro } from '@sistema-monitoreo/shared-contracts';

/** Etiqueta y variante de badge para cada nivel de logro. */
export const NIVEL_LOGRO_UI: Record<NivelLogro, { label: string; variant: string }> = {
  INICIO: { label: 'Crítico', variant: 'destructive' },
  EN_PROCESO: { label: 'En Proceso', variant: 'warning' },
  LOGRO_ESPERADO: { label: 'Satisfactorio', variant: 'success' },
  LOGRO_DESTACADO: { label: 'Destacado', variant: 'success' },
};

export const nivelLogroUi = (nivel: NivelLogro) =>
  NIVEL_LOGRO_UI[nivel] ?? { label: nivel, variant: 'secondary' };

/** Iniciales (hasta 2) a partir de un nombre completo. */
export const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
