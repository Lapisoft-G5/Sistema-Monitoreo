import { get, set, createStore } from 'idb-keyval';
import type { OperacionOffline, TipoOperacion } from './outbox-tipos';
import { nuevaOperacion } from './outbox-logica';

/**
 * Persistencia de la cola de envío en IndexedDB.
 *
 * Capa fina sobre `idb-keyval`: guarda y lee el arreglo de operaciones. Las
 * reglas (qué enviar, cómo reintentar) viven en `outbox-logica.ts`, con pruebas.
 */

const store = createStore('sistema-monitoreo-offline', 'outbox');
const CLAVE = 'operaciones';

const idFactory = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Todas las operaciones guardadas, en el orden en que están. */
export async function listarOperaciones(): Promise<OperacionOffline[]> {
  return (await get<OperacionOffline[]>(CLAVE, store)) ?? [];
}

/** Reemplaza el arreglo completo de operaciones. */
export async function guardarOperaciones(ops: readonly OperacionOffline[]): Promise<void> {
  await set(CLAVE, ops, store);
}

/** Agrega una operación nueva al final de la cola y devuelve su id. */
export async function encolar(tipo: TipoOperacion, payload: unknown): Promise<string> {
  const op = nuevaOperacion(idFactory(), tipo, payload);
  const ops = await listarOperaciones();
  await guardarOperaciones([...ops, op]);
  return op.id;
}

/** Sustituye una operación por su versión actualizada (misma id). */
export async function actualizarOperacion(op: OperacionOffline): Promise<void> {
  const ops = await listarOperaciones();
  await guardarOperaciones(ops.map((o) => (o.id === op.id ? op : o)));
}

/** Descarta las operaciones ya enviadas, para no acumularlas. */
export async function limpiarEnviadas(): Promise<void> {
  const ops = await listarOperaciones();
  await guardarOperaciones(ops.filter((o) => o.estado !== 'enviada'));
}
