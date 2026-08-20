import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@shared/config/api';

/**
 * Detección de conexión real.
 *
 * `navigator.onLine` sólo dice si hay una red conectada, no si el servidor
 * responde: en una IE con wifi sin salida a internet daría "en línea" y la
 * sincronización fallaría igual. Por eso se confirma con un ping al API —una
 * respuesta con cualquier estado HTTP (incluido 401) prueba que el backend está
 * alcanzable; sólo un error de red significa que no hay conexión—.
 */

/** ¿El backend responde? Cualquier respuesta HTTP cuenta; sólo el error de red es "offline". */
export async function apiAlcanzable(timeoutMs = 4000): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(`${API_BASE_URL}/api/notificaciones`, {
      method: 'HEAD',
      credentials: 'include',
      signal: ctrl.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Estado de conexión reactivo. Parte de `navigator.onLine` y lo confirma con un
 * ping al recuperar la red, para no anunciar "en línea" sin salida real.
 */
export function useEstadoConexion() {
  const [enLinea, setEnLinea] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    let vivo = true;
    const confirmar = async () => {
      const ok = await apiAlcanzable();
      if (vivo) setEnLinea(ok);
    };
    const alConectar = () => void confirmar();
    const alDesconectar = () => setEnLinea(false);

    window.addEventListener('online', alConectar);
    window.addEventListener('offline', alDesconectar);
    if (navigator.onLine) void confirmar();

    return () => {
      vivo = false;
      window.removeEventListener('online', alConectar);
      window.removeEventListener('offline', alDesconectar);
    };
  }, []);

  return { enLinea };
}
