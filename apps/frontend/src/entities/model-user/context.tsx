import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from './model';

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleInvalidation = () => {
      setUser(null);
    };
    window.addEventListener('auth-invalidation', handleInvalidation);
    return () => window.removeEventListener('auth-invalidation', handleInvalidation);
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('ugel_penalty_expiry');
    setUser(null);
  };

  const changePassword = useCallback(async (_newPassword: string) => {
    // TODO: Conectar con el endpoint real del backend
    // await authApi.changePassword(newPassword);
    await new Promise((resolve) => setTimeout(resolve, 800));

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