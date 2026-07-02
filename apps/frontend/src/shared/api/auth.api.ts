import type { ILoginResponse, ILoginError } from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

export const authApi = {
  login: async (
    dni: string,
    password: string,
  ): Promise<{ ok: boolean; data?: ILoginResponse; error?: ILoginError }> => {
    try {
      const data = await request<ILoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ dni, password }),
      });
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err as ILoginError };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await request<void>('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error invalidating session in backend on logout:', err);
    }
  },

  changePassword: async (
    newPassword: string,
  ): Promise<{
    ok: boolean;
    data?: { accessToken?: string; refreshToken?: string };
    error?: unknown;
  }> => {
    try {
      const data = await request<{ accessToken?: string; refreshToken?: string }>(
        '/api/auth/change-password',
        { method: 'POST', body: JSON.stringify({ newPassword }) },
      );
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  forgotPassword: async (dni: string, email: string): Promise<{ ok: boolean; error?: unknown }> => {
    try {
      await request<unknown>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ dni, email }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<{ ok: boolean; error?: unknown }> => {
    try {
      await request<unknown>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{
    ok: boolean;
    data?: { accessToken: string; refreshToken: string };
    error?: unknown;
  }> => {
    try {
      const data = await request<{ accessToken: string; refreshToken: string }>(
        '/api/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken }) },
      );
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  },
};
