import { describe, it, expect } from 'vitest';
import {
  claseBadgeEstado,
  claseEtiquetaVisita,
  clasePuntoEstado,
  formatearFechaLarga,
  formatearFechaVisita,
  formatearHoraVisita,
} from './visita-presentacion';

/**
 * Pruebas de los traductores de estado a presentación.
 *
 * Fase 5 de PLAN_REMEDIACION.md. Vivían sueltos en la cabecera de
 * `CalendarioSidebar`. `formatearFechaVisita` tiene tres caminos de salida y
 * ninguno estaba cubierto, siendo la fecha que el evaluador usa para saber si
 * hoy le toca la visita.
 */

describe('formatearFechaVisita', () => {
  it('formatea una fecha ISO al formato peruano', () => {
    expect(formatearFechaVisita('2026-03-09T14:30:00.000Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('cae a la parte de fecha cuando el valor no es una fecha válida', () => {
    expect(formatearFechaVisita('no-es-fecha T sobrante')).toBe('no-es-fecha ');
  });

  it('devuelve el valor original cuando no hay separador ni fecha válida', () => {
    expect(formatearFechaVisita('cualquier-cosa')).toBe('cualquier-cosa');
  });

  it('devuelve la cadena vacía tal cual', () => {
    expect(formatearFechaVisita('')).toBe('');
  });
});

describe('claseBadgeEstado', () => {
  it.each([
    ['PROGRAMADO', 'blue'],
    ['EN_PROCESO', 'rose'],
    ['COMPLETADO', 'emerald'],
    ['REPROGRAMADO', 'amber'],
    ['CANCELADO', 'slate'],
  ])('usa la paleta %s → %s', (estado, paleta) => {
    expect(claseBadgeEstado(estado)).toContain(paleta);
  });

  it('cae a la paleta neutra ante un estado desconocido', () => {
    expect(claseBadgeEstado('ANULADO')).toBe('bg-slate-100 text-slate-700');
  });
});

describe('clasePuntoEstado', () => {
  it.each([
    ['PROGRAMADO', 'bg-blue-500'],
    ['EN_PROCESO', 'bg-rose-500'],
    ['COMPLETADO', 'bg-emerald-500'],
    ['REPROGRAMADO', 'bg-amber-500'],
    ['CANCELADO', 'bg-slate-400'],
  ])('asigna a %s el punto %s', (estado, esperado) => {
    expect(clasePuntoEstado(estado)).toBe(esperado);
  });

  it('cae al punto neutro ante un estado desconocido', () => {
    expect(clasePuntoEstado('ANULADO')).toBe('bg-slate-400');
  });
});

describe('formatearHoraVisita', () => {
  it('convierte la hora ISO a formato de 12 horas', () => {
    expect(formatearHoraVisita('2026-03-09T14:30:00')).toBe('2:30 PM');
  });

  it('muestra la medianoche como 12 AM, no como 0', () => {
    expect(formatearHoraVisita('2026-03-09T00:15:00')).toBe('12:15 AM');
  });

  it('muestra el mediodía como 12 PM, no como 0', () => {
    expect(formatearHoraVisita('2026-03-09T12:00:00')).toBe('12:00 PM');
  });

  it('trata las once de la mañana como AM y las once de la noche como PM', () => {
    expect(formatearHoraVisita('2026-03-09T11:59:00')).toBe('11:59 AM');
    expect(formatearHoraVisita('2026-03-09T23:59:00')).toBe('11:59 PM');
  });

  it('devuelve el valor original cuando no hay hora que leer', () => {
    expect(formatearHoraVisita('no-es-fecha')).toBe('no-es-fecha');
  });
});

describe('formatearFechaLarga', () => {
  it('escribe la fecha en palabras con el día de la semana', () => {
    const resultado = formatearFechaLarga('2026-03-09T14:30:00');

    expect(resultado).toContain('9');
    expect(resultado).toContain('marzo');
    expect(resultado).toContain('2026');
  });

  it('empieza en mayúscula', () => {
    const resultado = formatearFechaLarga('2026-03-09');
    expect(resultado[0]).toBe(resultado[0].toUpperCase());
  });

  it('interpreta la fecha en horario local, sin desplazarla por zona horaria', () => {
    // Con interpretación UTC, un 1 de mes retrocedería al mes anterior.
    expect(formatearFechaLarga('2026-03-01')).toContain('marzo');
  });

  it('devuelve el valor original cuando no es una fecha', () => {
    expect(formatearFechaLarga('cualquier-cosa')).toBe('cualquier-cosa');
  });
});

describe('claseEtiquetaVisita', () => {
  it.each([
    ['PROGRAMADO', 'blue'],
    ['EN_PROCESO', 'rose'],
    ['COMPLETADO', 'emerald'],
    ['REPROGRAMADO', 'amber'],
  ])('usa la paleta %s → %s', (estado, paleta) => {
    expect(claseEtiquetaVisita(estado)).toContain(paleta);
  });

  it('cae a la paleta neutra ante un estado desconocido', () => {
    expect(claseEtiquetaVisita('ANULADO')).toContain('slate');
  });
});
