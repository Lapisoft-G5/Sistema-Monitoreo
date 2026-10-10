import type { OperacionOffline, TipoOperacion, EstadoOperacion } from './outbox-tipos';

/**
 * Reglas puras de la cola de envío, sin IndexedDB, para poder probarlas solas.
 * El almacenamiento vive en `outbox.ts`; acá sólo se decide qué es lo siguiente
 * a enviar y cómo cambia una entrada según el resultado del envío.
 */

/** Tras cuántos fallos una entrada deja de reintentarse sola y queda marcada en error. */
export const MAX_INTENTOS = 5;

/** Lo que el ejecutor informa tras intentar enviar una operación. */
export type ResultadoEnvio =
  | 'ok' // llegó al servidor (o ya estaba: idempotente)
  | 'reintentar' // fallo transitorio (sin red, 5xx): se reintenta luego
  | 'permanente'; // fallo definitivo (4xx no recuperable): requiere revisión

const ahora = () => Date.now();

/** Crea una entrada nueva, en estado pendiente. */
export function nuevaOperacion(
  id: string,
  tipo: TipoOperacion,
  payload: unknown,
): OperacionOffline {
  const t = ahora();
  return { id, tipo, payload, estado: 'pendiente', intentos: 0, creadaEn: t, actualizadaEn: t };
}

/** ¿Esta entrada está esperando ser enviada? (pendiente, o en error aún reintentable) */
export function esEnviable(op: OperacionOffline): boolean {
  if (op.estado === 'pendiente') return true;
  if (op.estado === 'error') return op.intentos < MAX_INTENTOS;
  return false;
}

/** La primera entrada enviable, respetando el orden de llegada. */
export function siguientePendiente(ops: readonly OperacionOffline[]): OperacionOffline | null {
  return [...ops].sort((a, b) => a.creadaEn - b.creadaEn).find(esEnviable) ?? null;
}

/** Cuántas entradas quedan por enviar (para el contador de la UI). */
export function contarPendientes(ops: readonly OperacionOffline[]): number {
  return ops.filter((o) => o.estado !== 'enviada').length;
}

/** Devuelve la entrada actualizada según el resultado del intento de envío. */
export function aplicarResultado(
  op: OperacionOffline,
  resultado: ResultadoEnvio,
  error?: string,
): OperacionOffline {
  const base = { ...op, actualizadaEn: ahora() };
  if (resultado === 'ok') return { ...base, estado: 'enviada', error: undefined };

  const intentos = op.intentos + 1;
  const estado: EstadoOperacion =
    resultado === 'permanente' || intentos >= MAX_INTENTOS ? 'error' : 'pendiente';
  return { ...base, estado, intentos, error };
}

/** Extrae la clave de destino de una operación (visita + plantilla) para deduplicación. */
export function claveDestino(op: OperacionOffline): string | null {
  const p = op.payload as { visitId?: string; cronogramaId?: string; plantillaId?: string } | null;
  const visitId = p?.visitId ?? p?.cronogramaId;
  if (!visitId) return null;
  return `${visitId}:${p?.plantillaId ?? ''}`;
}

/**
 * Agrega o compacta una operación en la cola.
 *
 * Si ya hay una operación pendiente (o en reintento) para la misma visita y plantilla:
 * - Un 'finalizar-ficha' nuevo sobreescribe un 'guardar-borrador' o un 'finalizar-ficha' anterior.
 * - Un 'guardar-borrador' nuevo actualiza el 'guardar-borrador' anterior con las respuestas más recientes.
 * - Un 'firmar-ficha' nuevo actualiza la firma anterior para esa visita.
 *
 * Mantiene la cola limpia y evita peticiones redundantes sin perder nada.
 */
export function compactarOperaciones(
  ops: readonly OperacionOffline[],
  nueva: OperacionOffline,
): OperacionOffline[] {
  const destinoNueva = claveDestino(nueva);
  if (!destinoNueva) return [...ops, nueva];

  const indiceExistente = ops.findIndex((existente) => {
    if (existente.estado === 'enviada') return false;
    if (claveDestino(existente) !== destinoNueva) return false;

    // Ficha con ficha
    if (
      (nueva.tipo === 'guardar-borrador' || nueva.tipo === 'finalizar-ficha') &&
      (existente.tipo === 'guardar-borrador' || existente.tipo === 'finalizar-ficha')
    ) {
      return true;
    }

    // Firma con firma
    if (nueva.tipo === 'firmar-ficha' && existente.tipo === 'firmar-ficha') {
      return true;
    }

    return false;
  });

  if (indiceExistente === -1) {
    return [...ops, nueva];
  }

  const copia = [...ops];
  copia[indiceExistente] = {
    ...nueva,
    id: copia[indiceExistente].id, // preservamos el id para estabilidad
    creadaEn: copia[indiceExistente].creadaEn, // preservamos orden FIFO de llegada
    actualizadaEn: ahora(),
  };
  return copia;
}

