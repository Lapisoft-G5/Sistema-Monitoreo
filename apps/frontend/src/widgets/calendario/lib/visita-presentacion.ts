/**
 * Traducción del estado de una visita a su presentación.
 *
 * Fase 5 de PLAN_REMEDIACION.md. Estaban sueltos en la cabecera de
 * `CalendarioSidebar`, entre la maquetación. Son puros y los comparten varios
 * componentes del panel, así que su lugar es acá.
 */

/** Paleta por estado, para el distintivo y para el punto de color. */
const PALETA_POR_ESTADO: Record<string, { badge: string; punto: string }> = {
  PROGRAMADO: { badge: 'bg-blue-100 text-blue-800 border-blue-200', punto: 'bg-blue-500' },
  EN_PROCESO: { badge: 'bg-rose-100 text-rose-800 border-rose-200', punto: 'bg-rose-500' },
  COMPLETADO: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    punto: 'bg-emerald-500',
  },
  REPROGRAMADO: { badge: 'bg-amber-100 text-amber-800 border-amber-200', punto: 'bg-amber-500' },
  CANCELADO: { badge: 'bg-slate-100 text-slate-700 border-slate-200', punto: 'bg-slate-400' },
};

/** Neutro para estados sin paleta propia, como `ANULADO`. */
const PALETA_NEUTRA = { badge: 'bg-slate-100 text-slate-700', punto: 'bg-slate-400' };

export const claseBadgeEstado = (estado: string): string =>
  (PALETA_POR_ESTADO[estado] ?? PALETA_NEUTRA).badge;

export const clasePuntoEstado = (estado: string): string =>
  (PALETA_POR_ESTADO[estado] ?? PALETA_NEUTRA).punto;

/**
 * Fecha de la visita en formato peruano.
 *
 * Degrada en dos pasos antes que mostrar un error: si el valor no es una fecha
 * interpretable, se queda con lo que haya antes de la `T`; si tampoco eso sirve,
 * devuelve el valor original. Es la fecha con la que el evaluador decide si hoy
 * le toca la visita, de modo que mostrar algo imperfecto es preferible a no
 * mostrar nada.
 */
export const formatearFechaVisita = (fechaHora: string): string => {
  const fecha = new Date(fechaHora);
  if (!isNaN(fecha.getTime())) {
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return fechaHora.split('T')[0];
};
