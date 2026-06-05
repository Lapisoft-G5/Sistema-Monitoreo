import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../../entities/user';
import type { ILoginResponse } from '@sistema-monitoreo/shared-contracts';

// Constantes de penalización de la UI
const MAX_ATTEMPTS = 3;
const PENALTY_TIME = 1800; // 30 minutos en segundos

// ── INTERCEPTOR GLOBAL DE RED FETCH (develop) ──
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url || '';
    // Evitar bucles infinitos en endpoints de autenticación
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

  // Estados Globales de Seguridad / UI para manejo de bloqueos
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const penaltyExpiry = localStorage.getItem('ugel_penalty_expiry');
    if (penaltyExpiry) {
      const remaining = Math.ceil((parseInt(penaltyExpiry) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [isPenalized, setIsPenalized] = useState<boolean>(() => timeLeft > 0);
  const [attempts, setAttempts] = useState<number>(() => (timeLeft > 0 ? MAX_ATTEMPTS : 0));
  const [showFailedModal, setShowFailedModal] = useState<boolean>(false);

  // Efecto 1: Escuchar invalidación de sesión desde el Interceptor (develop)
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

  // Efecto 2: Cuenta regresiva para la penalización de UI
  useEffect(() => {
    if (!isPenalized) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('ugel_penalty_expiry');
          setTimeout(() => {
            setIsPenalized(false);
            setAttempts(0);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPenalized]);

  // ── MÉTODO LOGIN (CONEXIÓN BACKEND + FLUJO DE INTENTOS) ──
  const login = async (dni: string, password: string) => {
    if (isPenalized) {
      return { success: false, error: 'Sistema penalizado temporalmente', isBlocked: true };
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const backendAttempts = errJson.failedLoginAttempts ?? errJson.failedAttempts;
        const nextAttempts = backendAttempts !== undefined ? backendAttempts : attempts + 1;
        setAttempts(nextAttempts);

        // Si excede intentos locales o el backend devuelve marca de bloqueo temporal
        if (nextAttempts >= MAX_ATTEMPTS || errJson.lockedUntil) {
          const expiryTime = errJson.lockedUntil 
            ? new Date(errJson.lockedUntil).getTime() 
            : Date.now() + PENALTY_TIME * 1000;
          
          const calculatedPenaltyTime = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000)) || PENALTY_TIME;

          localStorage.setItem('ugel_penalty_expiry', expiryTime.toString());
          setIsPenalized(true);
          setTimeLeft(calculatedPenaltyTime);
          setShowFailedModal(false);

          return {
            success: false,
            error: errJson.message || 'Demasiados intentos fallidos. Acceso bloqueado.',
            isBlocked: true,
            lockedUntil: errJson.lockedUntil || null,
            failedLoginAttempts: nextAttempts,
            remainingAttempts: 0,
          };
        } else {
          setShowFailedModal(true);
          return {
            success: false,
            error: errJson.message || 'Credenciales o datos incorrectos',
            lockedUntil: null,
            failedLoginAttempts: nextAttempts,
            remainingAttempts: errJson.remainingAttempts !== undefined ? errJson.remainingAttempts : MAX_ATTEMPTS - nextAttempts,
          };
        }
      }

      const data: ILoginResponse = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.removeItem('ugel_penalty_expiry');
      setAttempts(0);

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
      return { success: false, error: 'No se pudo establecer conexión con el servidor' };
    }
  };

  // ── MÉTODO LOGOUT REAL ──
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

  // ── MÉTODO CHANGE PASSWORD REAL ──
  const changePassword = async (newPassword: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No se encontró el token de acceso');

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

      if (user) setUser({ ...user, firstLogin: false });
      setRequiresPasswordChange(false);
    } catch (error) {
      console.error('Error during changePassword integration:', error);
      throw error;
    }
  };

  // ── MÉTODOS RECUPERACIÓN DE CUENTA ──
  const forgotPassword = async (dni: string, email: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, email }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { success: false, error: errJson.message || 'No se pudo procesar la solicitud' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error in forgotPassword integration:', error);
      return { success: false, error: 'No se pudo establecer conexión con el servidor' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { success: false, error: errJson.message || 'El enlace de recuperación es inválido o expiró' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword integration:', error);
      return { success: false, error: 'No se pudo establecer conexión con el servidor' };
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
        attempts,
        isPenalized,
        timeLeft,
        showFailedModal,
        setShowFailedModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};