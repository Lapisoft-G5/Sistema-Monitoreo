const RELOAD_KEY = 'chunk_reload_timestamp';
const COOLDOWN_MS = 10000;

/**
 * Detecta si un error proviene de un chunk dinámico que dejó de existir
 * en el servidor tras un nuevo despliegue.
 */
export function isChunkLoadError(error?: unknown): boolean {
  const message =
    (error instanceof Error ? error.message : typeof error === 'string' ? error : '') || '';

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('Unable to preload CSS')
  );
}

/**
 * Ejecuta una recarga completa del navegador para descargar el nuevo index.html
 * y el mapa actualizado de chunks, protegiendo contra loops infinitos con un cooldown.
 */
export function reloadForNewVersion(): void {
  if (typeof window === 'undefined') return;

  const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  const now = Date.now();

  if (now - lastReload > COOLDOWN_MS) {
    sessionStorage.setItem(RELOAD_KEY, String(now));
    window.location.reload();
  }
}

/**
 * Inicializa los listeners globales para auto-recargar de forma transparente
 * cuando Vite o el navegador fallen al cargar un chunk dinámico desfasado.
 */
export function setupChunkReloadHandler(): void {
  if (typeof window === 'undefined') return;

  // 1. Evento nativo que Vite emite al fallar la precarga de un módulo dinámico
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadForNewVersion();
  });

  // 2. Errores no capturados en promesas (típico de React.lazy(() => import(...)))
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault();
      reloadForNewVersion();
    }
  });

  // 3. Errores globales de script en ventana
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
      event.preventDefault();
      reloadForNewVersion();
    }
  });
}
