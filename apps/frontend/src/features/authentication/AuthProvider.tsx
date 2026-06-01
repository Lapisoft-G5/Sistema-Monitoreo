import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../../entities/user';
import type { ILoginResponse } from '@sistema-monitoreo/shared-contracts';

// Interceptor global de red (Fetch) para capturar 401 y 403 (Sesiones revocadas o primer acceso incumplido)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url || '';
    // No interceptar llamadas base de login o recuperación para evitar bucles infinitos
    if (
      !url.includes('/api/auth/login') &&
      !url.includes('/api/auth/forgot-password') &&
      !url.includes('/api/auth/reset-password')
    ) {
      console.warn('HTTP Interceptor: Acceso denegado (401/403) detectado. Forzando deslogueo local...');
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth-invalidation'));
    }
  }
  return response;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    const handleInvalidation = () => {
      setUser(null);
      setRequiresPasswordChange(false);
    };
    window.addEventListener('auth-invalidation', handleInvalidation);
    return () => {
      window.removeEventListener('auth-invalidation', handleInvalidation);
    };
  }, []);

  const login = async (dni: string, password: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni, password }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.message || 'Credenciales o datos incorrectos',
          lockedUntil: errJson.lockedUntil || null,
          failedLoginAttempts: errJson.failedLoginAttempts !== undefined ? errJson.failedLoginAttempts : errJson.failedAttempts || null,
          remainingAttempts: errJson.remainingAttempts !== undefined ? errJson.remainingAttempts : null,
        };
      }

      const data: ILoginResponse = await response.json();
      localStorage.setItem('accessToken', data.accessToken);

      setRequiresPasswordChange(data.user.firstLogin);
      
      setUser({
        id: data.user.id,
        dni: data.user.dni,
        nombres: data.user.nombres,
        apellidos: data.user.apellidos,
        role: data.user.role as User['role'],
        firstLogin: data.user.firstLogin,
        institucion: data.user.institucion,
        distrito: data.user.distrito,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in login integration:', error);
      return {
        success: false,
        error: 'No se pudo establecer conexión con el servidor',
      };
    }
  };

  const logout = async () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Error invalidating session in backend on logout:', err);
      }
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    setRequiresPasswordChange(false);
  };

  const changePassword = async (newPassword: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No se encontró el token de acceso');
      }

      const response = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al actualizar la contraseña');
      }

      if (user) {
        setUser({ ...user, firstLogin: false });
      }
      setRequiresPasswordChange(false);
    } catch (error) {
      console.error('Error during changePassword integration:', error);
      throw error;
    }
  };

  const forgotPassword = async (dni: string, email: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni, email }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.message || 'No se pudo procesar la solicitud de recuperación',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in forgotPassword integration:', error);
      return {
        success: false,
        error: 'No se pudo establecer conexión con el servidor',
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.message || 'El enlace de recuperación es inválido o ha expirado',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword integration:', error);
      return {
        success: false,
        error: 'No se pudo establecer conexión con el servidor',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        requiresPasswordChange,
        login,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
