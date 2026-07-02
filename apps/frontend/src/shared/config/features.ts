/**
 * Feature flags del frontend.
 *
 * Para alternar entre los modos de persistencia sin recompilar,
 * expone estas flags via VITE_* (variables de entorno en .env).
 *
 * Modos:
 *  - 'local': persistencia solo en localStorage (modo legacy, sprint 1-2)
 *  - 'hybrid': localStorage + API best-effort (modo actual, sprint 3)
 *  - 'api': solo API, localStorage deshabilitado (sprint 4+)
 *
 * En .env:
 *   VITE_PERSISTENCE_MODE=hybrid
 */

type PersistenceMode = 'local' | 'hybrid' | 'api';

function readMode(): PersistenceMode {
  const raw = (import.meta as { env?: Record<string, string> }).env?.VITE_PERSISTENCE_MODE;
  if (raw === 'local' || raw === 'hybrid' || raw === 'api') return raw;
  return 'hybrid';
}

export const PERSISTENCE_MODE: PersistenceMode = readMode();

export const FEATURES = {
  /** Si es true, NO escribe en localStorage. Lee del backend via TanStack Query. */
  apiOnly: PERSISTENCE_MODE === 'api',
  /** Si es true, escribe en localStorage Y sincroniza con backend (best-effort). */
  hybrid: PERSISTENCE_MODE === 'hybrid',
  /** Si es true, usa solo localStorage. Sin red. */
  localOnly: PERSISTENCE_MODE === 'local',
} as const;
