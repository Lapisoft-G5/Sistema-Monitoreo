import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from './model';
import { authApi } from '@/shared/api/auth.api';
import { UserContext } from './user-context';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Sincronizar el usuario con localStorage cuando cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    const handleInvalidation = () => {
      setUser(null);
    };
    window.addEventListener('auth-invalidation', handleInvalidation);
    return () => window.removeEventListener('auth-invalidation', handleInvalidation);
  }, []);

  const logout = useCallback(() => {
    // Llamamos a la API para invalidar sesión en BD sin esperar resultado para no bloquear UI
    authApi.logout().catch(console.error);

    localStorage.removeItem('accessToken'); // Limpieza por si quedó de la versión anterior
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('ugel_penalty_expiry');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    // La sesión actual se maneja vía cookies HttpOnly en el backend.
    // Al cambiar la contraseña, el backend limpia las cookies de sesión por seguridad,
    // invalidando el acceso actual. Forzamos la redirección al login limpiando el estado local.
    const res = await authApi.changePassword(newPassword);
    if (!res.ok) {
      throw new Error(
        (res.error as { message?: string })?.message || 'Error al cambiar contraseña',
      );
    }

    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
        changePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
