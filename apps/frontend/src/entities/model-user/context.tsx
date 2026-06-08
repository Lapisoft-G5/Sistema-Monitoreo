import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from './model';
import { authApi } from '@/shared/api/auth.api';

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};

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
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Llamamos a la API para invalidar sesión en BD sin esperar resultado para no bloquear UI
      authApi.logout(token).catch(console.error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('ugel_penalty_expiry');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No hay sesión activa');
    
    const res = await authApi.changePassword(token, newPassword);
    if (!res.ok) {
      throw new Error((res.error as { message?: string })?.message || 'Error al cambiar contraseña');
    }

    if (res.data?.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
    }

    // Marca al usuario como que ya no es su primer login
    setUser((prev) => (prev ? { ...prev, firstLogin: false } : null));
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