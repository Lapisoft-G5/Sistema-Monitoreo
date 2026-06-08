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
    } else if (args[0] instanceof Request && args[0].credentials === 'omit') {
      // Si fue creado con Request, no lo podemos mutar tan fácilmente, pero se asume que las configuraciones globales ya pasaron 'include'
    }

    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
      
      const isAuthUrl = url.includes('/api/auth/');
      if (!isAuthUrl) {
        if (!isRefreshing) {
          isRefreshing = true;
          // Llamamos a refresh() asumiendo que las cookies se enviarán automáticamente
          refreshPromise = authApi.refreshToken('').then(res => {
            isRefreshing = false;
            return res.ok;
          }).catch(() => {
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

        console.warn('HTTP Interceptor: Token expirado y sin token de refreso válido. Forzando deslogueo...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth-invalidation'));
      }
    } else if (response.status === 403) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
      if (!url.includes('/api/auth/login')) {
         console.warn('HTTP Interceptor: Error 403. Forzando deslogueo local...');
         localStorage.removeItem('accessToken');
         localStorage.removeItem('refreshToken');
         window.dispatchEvent(new Event('auth-invalidation'));
      }
    }
    
    return response;
  };
};