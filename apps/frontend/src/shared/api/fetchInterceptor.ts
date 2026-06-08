import { authApi } from './auth.api';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
      
      const isAuthUrl = url.includes('/api/auth/');
      if (!isAuthUrl) {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = authApi.refreshToken(refreshToken).then(res => {
              isRefreshing = false;
              if (res.ok && res.data?.accessToken) {
                localStorage.setItem('accessToken', res.data.accessToken);
                if (res.data.refreshToken) {
                  localStorage.setItem('refreshToken', res.data.refreshToken);
                }
                return res.data.accessToken;
              }
              return null;
            }).catch(() => {
              isRefreshing = false;
              return null;
            });
          }
          
          const newAccessToken = await refreshPromise;
          if (newAccessToken) {
            // Reintentar la llamada original
            if (typeof args[0] === 'string' || args[0] instanceof URL) {
              const url = args[0];
              const options = { ...(args[1] as RequestInit) };
              options.headers = { ...options.headers, Authorization: `Bearer ${newAccessToken}` };
              return await originalFetch(url, options);
            } else if (args[0] instanceof Request) {
              const req = args[0].clone();
              req.headers.set('Authorization', `Bearer ${newAccessToken}`);
              return await originalFetch(req, args[1] as RequestInit);
            }
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