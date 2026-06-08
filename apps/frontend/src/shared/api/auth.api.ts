import type { ILoginResponse, ILoginError } from '@sistema-monitoreo/shared-contracts';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authApi = {
  login: async (dni: string, password: string): Promise<{ ok: boolean; data?: ILoginResponse; error?: ILoginError }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch {
      return { ok: false, error: { message: 'No se pudo establecer conexión con el servidor' } };
    }
  },

  logout: async (token: string): Promise<void> => {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Error invalidating session in backend on logout:', err);
    }
  },

  changePassword: async (token: string, newPassword: string): Promise<{ ok: boolean; data?: { accessToken?: string; refreshToken?: string }; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch {
      return { ok: false, error: { message: 'No se pudo establecer conexión con el servidor' } };
    }
  },

  forgotPassword: async (dni: string, email: string): Promise<{ ok: boolean; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, email }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: { message: 'No se pudo establecer conexión con el servidor' } };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ ok: boolean; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: { message: 'No se pudo establecer conexión con el servidor' } };
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ ok: boolean; data?: { accessToken: string; refreshToken: string }; error?: unknown }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { ok: false, error: errJson };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch {
      return { ok: false, error: { message: 'No se pudo establecer conexión con el servidor' } };
    }
  }
};
