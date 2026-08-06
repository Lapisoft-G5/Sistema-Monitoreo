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

/** Etiqueta de visita dentro de una celda del calendario, con estado de hover. */
const ETIQUETA_POR_ESTADO: Record<string, string> = {
  PROGRAMADO: 'bg-blue-50/70 text-blue-800 border-blue-200 hover:bg-blue-100/70',
  EN_PROCESO: 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100/70',
  COMPLETADO: 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70',
  REPROGRAMADO: 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100/70',
  CANCELADO: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
};

/** Sin hover: un estado sin etiqueta propia tampoco es pulsable. */
const ETIQUETA_NEUTRA = 'bg-slate-50 text-slate-700 border-slate-200';

export const claseEtiquetaVisita = (estado: string): string =>
  ETIQUETA_POR_ESTADO[estado] ?? ETIQUETA_NEUTRA;

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

/** Opciones de fecha en palabras, con el día de la semana por delante. */
const FECHA_LARGA: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

const conInicialMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Fecha de la visita escrita en palabras: «Lunes, 9 de marzo de 2026».
 *
 * Descompone `YYYY-MM-DD` a mano en lugar de dejárselo a `new Date(cadena)`
 * porque ese constructor interpreta la forma corta como UTC: en un huso al
 * oeste de Greenwich, el día 1 de un mes retrocedería al mes anterior.
 */
export const formatearFechaLarga = (fechaHora: string): string => {
  const [anio, mes, dia] = fechaHora.split('T')[0].split('-').map(Number);
  if (anio && mes && dia) {
    const fecha = new Date(anio, mes - 1, dia);
    if (!isNaN(fecha.getTime())) {
      return conInicialMayuscula(fecha.toLocaleDateString('es-ES', FECHA_LARGA));
    }
  }

  const fecha = new Date(fechaHora);
  if (!isNaN(fecha.getTime())) {
    return conInicialMayuscula(fecha.toLocaleDateString('es-ES', FECHA_LARGA));
  }
  return fechaHora;
};

/**
 * Hora de la visita en formato de 12 horas.
 *
 * Lee la hora directamente de la cadena ISO en lugar de construir una `Date`,
 * para que la hora mostrada sea la que se registró y no la que resulte de
 * convertir husos.
 */
export const formatearHoraVisita = (fechaHora: string): string => {
  const [, horaConSegundos] = fechaHora.split('T');
  if (horaConSegundos) {
    const [horas, minutos] = horaConSegundos.split(':');
    const hora = parseInt(horas, 10);
    const meridiano = hora >= 12 ? 'PM' : 'AM';
    // El resto de 12 da 0 tanto a medianoche como al mediodía; ambas se
    // muestran como 12, no como 0.
    return `${hora % 12 || 12}:${minutos} ${meridiano}`;
  }

  const fecha = new Date(fechaHora);
  if (!isNaN(fecha.getTime())) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return fechaHora;
};
