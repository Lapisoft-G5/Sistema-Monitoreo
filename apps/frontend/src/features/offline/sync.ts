import { ErrorDeApi } from '@shared/config/api';
import { finalizarFichaCompleta, type PayloadFinalizarFicha } from '@features/monitoreos/lib/ficha-envio';
import { listarOperaciones, actualizarOperacion } from './outbox';
import { siguientePendiente, aplicarResultado, type ResultadoEnvio } from './outbox-logica';
import type { OperacionOffline } from './outbox-tipos';

/**
 * Motor de sincronización: drena la cola de envío contra el backend.
 *
 * Cada operación se ejecuta de forma idempotente (el modelo ya impide duplicar),
 * así que reintentar es seguro. El resultado decide qué pasa con la entrada:
 * enviada, reintentar (sin red / 5xx) o error permanente (4xx no recuperable).
 */

/** Traduce el fallo de un envío al resultado que entiende la cola. */
function clasificar(e: unknown): { resultado: ResultadoEnvio; error?: string } {
  if (e instanceof ErrorDeApi) {
    const msg = String(e.message ?? '');
    // "La ficha ya esta FINALIZADO/COMPLETADO": la operación ya surtió efecto en
    // un intento anterior. Es éxito idempotente, no un error.
    if (e.estado === 400 && /ya est[aá]/i.test(msg)) return { resultado: 'ok' };
    if (e.estado >= 400 && e.estado < 500) return { resultado: 'permanente', error: msg };
    return { resultado: 'reintentar', error: msg }; // 5xx: transitorio
  }
  // Sin respuesta HTTP = error de red: se reintenta al recuperar conexión.
  return { resultado: 'reintentar', error: 'sin conexión' };
}

async function ejecutar(op: OperacionOffline): Promise<{ resultado: ResultadoEnvio; error?: string }> {
  try {
    if (op.tipo === 'finalizar-ficha') {
      await finalizarFichaCompleta(op.payload as PayloadFinalizarFicha);
      return { resultado: 'ok' };
    }
    // Tipo aún no soportado por el motor: no se reintenta en vano.
    return { resultado: 'permanente', error: `operación no soportada: ${op.tipo}` };
  } catch (e) {
    return clasificar(e);
  }
}

// Evita dos drenados en paralelo (p. ej. reconexión + apertura de la app).
let sincronizando = false;

/**
 * Vacía la cola en orden. Se detiene ante el primer fallo transitorio (sin red o
 * 5xx) para no golpear en vano; volverá a intentarlo el próximo disparo.
 * Devuelve cuántas se enviaron con éxito.
 */
export async function sincronizarCola(): Promise<number> {
  if (sincronizando) return 0;
  sincronizando = true;
  let enviadas = 0;
  try {
    let op = siguientePendiente(await listarOperaciones());
    while (op) {
      const { resultado, error } = await ejecutar(op);
      await actualizarOperacion(aplicarResultado(op, resultado, error));
      if (resultado === 'ok') enviadas++;
      if (resultado === 'reintentar') break;
      op = siguientePendiente(await listarOperaciones());
    }
  } finally {
    sincronizando = false;
  }
  return enviadas;
}
