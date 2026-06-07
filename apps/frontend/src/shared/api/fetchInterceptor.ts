export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    if (response.status === 401 || response.status === 403) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
      
      if (
        !url.includes('/api/auth/login') &&
        !url.includes('/api/auth/forgot-password') &&
        !url.includes('/api/auth/reset-password')
      ) {
        console.warn('HTTP Interceptor: Acceso denegado. Forzando deslogueo local...');
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth-invalidation'));
      }
    }
    return response;
  };
};