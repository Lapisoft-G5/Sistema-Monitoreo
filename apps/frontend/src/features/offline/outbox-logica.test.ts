import { describe, it, expect } from 'vitest';
import {
  nuevaOperacion,
  esEnviable,
  siguientePendiente,
  contarPendientes,
  aplicarResultado,
  claveDestino,
  compactarOperaciones,
  MAX_INTENTOS,
} from './outbox-logica';
import type { OperacionOffline } from './outbox-tipos';

const op = (over: Partial<OperacionOffline> = {}): OperacionOffline => ({
  id: 'a',
  tipo: 'finalizar-ficha',
  payload: {},
  estado: 'pendiente',
  intentos: 0,
  creadaEn: 1,
  actualizadaEn: 1,
  ...over,
});

describe('nuevaOperacion', () => {
  it('nace pendiente y sin intentos', () => {
    const n = nuevaOperacion('id-1', 'firmar-ficha', { fichaId: 'f1' });
    expect(n).toMatchObject({ id: 'id-1', tipo: 'firmar-ficha', estado: 'pendiente', intentos: 0 });
  });
});

describe('esEnviable', () => {
  it('lo pendiente es enviable', () => expect(esEnviable(op())).toBe(true));
  it('lo enviado no es enviable', () => expect(esEnviable(op({ estado: 'enviada' }))).toBe(false));
  it('en error se reintenta mientras no supere el máximo', () => {
    expect(esEnviable(op({ estado: 'error', intentos: MAX_INTENTOS - 1 }))).toBe(true);
    expect(esEnviable(op({ estado: 'error', intentos: MAX_INTENTOS }))).toBe(false);
  });
});

describe('siguientePendiente', () => {
  it('respeta el orden de llegada', () => {
    const nueva = op({ id: 'nueva', creadaEn: 100 });
    const vieja = op({ id: 'vieja', creadaEn: 10 });
    expect(siguientePendiente([nueva, vieja])?.id).toBe('vieja');
  });

  it('devuelve null si no hay enviables', () => {
    expect(siguientePendiente([op({ estado: 'enviada' })])).toBeNull();
  });
});

describe('contarPendientes', () => {
  it('cuenta todo lo que no está enviado', () => {
    expect(
      contarPendientes([op({ estado: 'enviada' }), op(), op({ estado: 'error', intentos: 9 })]),
    ).toBe(2);
  });
});

describe('aplicarResultado', () => {
  it('ok marca enviada y limpia el error', () => {
    const r = aplicarResultado(op({ error: 'x' }), 'ok');
    expect(r).toMatchObject({ estado: 'enviada', error: undefined });
  });

  it('reintentar suma un intento y queda pendiente', () => {
    const r = aplicarResultado(op({ intentos: 1 }), 'reintentar', 'sin red');
    expect(r).toMatchObject({ estado: 'pendiente', intentos: 2, error: 'sin red' });
  });

  it('reintentar hasta el máximo termina en error', () => {
    const r = aplicarResultado(op({ intentos: MAX_INTENTOS - 1 }), 'reintentar', 'sin red');
    expect(r).toMatchObject({ estado: 'error', intentos: MAX_INTENTOS });
  });

  it('permanente va directo a error', () => {
    const r = aplicarResultado(op(), 'permanente', 'ficha inválida');
    expect(r).toMatchObject({ estado: 'error', intentos: 1 });
  });
});

describe('claveDestino', () => {
  it('extrae clave de visitId y plantillaId', () => {
    expect(
      claveDestino(
        op({
          tipo: 'finalizar-ficha',
          payload: { visitId: 'v-10', plantillaId: 'pl-1' },
        }),
      ),
    ).toBe('v-10:pl-1');
  });

  it('extrae clave de cronogramaId para firmas', () => {
    expect(
      claveDestino(
        op({
          tipo: 'firmar-ficha',
          payload: { cronogramaId: 'c-20', plantillaId: 'pl-2' },
        }),
      ),
    ).toBe('c-20:pl-2');
  });

  it('devuelve null si no hay visitId ni cronogramaId', () => {
    expect(claveDestino(op({ payload: {} }))).toBeNull();
  });
});

describe('compactarOperaciones', () => {
  it('agrega nueva operación a cola vacía', () => {
    const nueva = nuevaOperacion('id-1', 'guardar-borrador', { visitId: 'v-1', plantillaId: 'p-1' });
    const res = compactarOperaciones([], nueva);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('id-1');
  });

  it('compacta múltiples guardados de borrador para la misma visita en una sola entrada actualizada', () => {
    const op1 = nuevaOperacion('id-1', 'guardar-borrador', {
      visitId: 'v-1',
      plantillaId: 'p-1',
      datos: { generalComments: 'Primero' },
    });
    const op2 = nuevaOperacion('id-2', 'guardar-borrador', {
      visitId: 'v-1',
      plantillaId: 'p-1',
      datos: { generalComments: 'Actualizado' },
    });

    const res = compactarOperaciones([op1], op2);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('id-1'); // Preserva id original para estabilidad
    expect((res[0].payload as { datos: { generalComments: string } }).datos.generalComments).toBe(
      'Actualizado',
    );
  });

  it('reemplaza guardar-borrador con finalizar-ficha cuando el usuario decide finalizar', () => {
    const borrador = nuevaOperacion('id-1', 'guardar-borrador', {
      visitId: 'v-1',
      plantillaId: 'p-1',
      datos: { generalComments: 'Borrador preliminar' },
    });
    const finalizar = nuevaOperacion('id-2', 'finalizar-ficha', {
      visitId: 'v-1',
      plantillaId: 'p-1',
      datos: { generalComments: 'Monitoreo cerrado' },
    });

    const res = compactarOperaciones([borrador], finalizar);
    expect(res).toHaveLength(1);
    expect(res[0].tipo).toBe('finalizar-ficha');
    expect((res[0].payload as { datos: { generalComments: string } }).datos.generalComments).toBe(
      'Monitoreo cerrado',
    );
  });

  it('mantiene finalizar-ficha y firmar-ficha como operaciones separadas en orden', () => {
    const fin = nuevaOperacion('id-1', 'finalizar-ficha', { visitId: 'v-1', plantillaId: 'p-1' });
    const firma = nuevaOperacion('id-2', 'firmar-ficha', { cronogramaId: 'v-1', plantillaId: 'p-1' });

    const conFin = compactarOperaciones([], fin);
    const conAmbos = compactarOperaciones(conFin, firma);

    expect(conAmbos).toHaveLength(2);
    expect(conAmbos[0].tipo).toBe('finalizar-ficha');
    expect(conAmbos[1].tipo).toBe('firmar-ficha');
  });

  it('no compacta operaciones de visitas distintas', () => {
    const opV1 = nuevaOperacion('id-1', 'finalizar-ficha', { visitId: 'v-1', plantillaId: 'p-1' });
    const opV2 = nuevaOperacion('id-2', 'finalizar-ficha', { visitId: 'v-2', plantillaId: 'p-1' });

    const res = compactarOperaciones([opV1], opV2);
    expect(res).toHaveLength(2);
  });

  it('no sobrescribe operaciones que ya fueron enviadas', () => {
    const enviada = {
      ...nuevaOperacion('id-1', 'finalizar-ficha', { visitId: 'v-1', plantillaId: 'p-1' }),
      estado: 'enviada' as const,
    };
    const nueva = nuevaOperacion('id-2', 'finalizar-ficha', { visitId: 'v-1', plantillaId: 'p-1' });

    const res = compactarOperaciones([enviada], nueva);
    expect(res).toHaveLength(2);
  });
});

