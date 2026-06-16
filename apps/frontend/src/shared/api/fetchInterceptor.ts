import { authApi } from './auth.api';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    // Configurar credentials por defecto
    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      args[1] = args[1] || {};
      if (args[1].credentials === undefined) {
        args[1].credentials = 'include';
      }
    }

    const response = await originalFetch(...args);

    if (response.status === 401) {
      let urlStr = '';
      if (typeof args[0] === 'string') {
        urlStr = args[0];
      } else if (args[0] instanceof URL) {
        urlStr = args[0].toString();
      } else if (args[0] instanceof Request) {
        urlStr = args[0].url;
      }

      const isAuthUrl = urlStr.includes('/api/auth/');
      if (!isAuthUrl) {
        if (!isRefreshing) {
          isRefreshing = true;
          // Llamamos a refresh() asumiendo que las cookies se enviarán automáticamente.
          // Enviamos 'from-cookie' para pasar la validación @IsNotEmpty() del backend.
          refreshPromise = authApi
            .refreshToken('from-cookie')
            .then((res) => {
              isRefreshing = false;
              return res.ok;
            })
            .catch(() => {
              isRefreshing = false;
              return false;
            });
        }

        const success = await refreshPromise;
        if (success) {
          // Reintentar la llamada original
          if (typeof args[0] === 'string' || args[0] instanceof URL) {
            const url = args[0];
            const options = { ...(args[1] as RequestInit) };
            return await originalFetch(url, options);
          } else if (args[0] instanceof Request) {
            const req = args[0].clone();
            return await originalFetch(req, args[1] as RequestInit);
          }
        }

        console.warn(
          'HTTP Interceptor: Token expirado y sin token de refresco válido. Forzando deslogueo...',
        );
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-invalidation'));
      }
    }

    return response;
  };
};
