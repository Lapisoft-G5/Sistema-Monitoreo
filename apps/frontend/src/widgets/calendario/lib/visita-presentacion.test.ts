import { describe, it, expect } from 'vitest';
import {
  claseBadgeEstado,
  clasePuntoEstado,
  formatearFechaVisita,
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
