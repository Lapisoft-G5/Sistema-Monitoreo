import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from './model';

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
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

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};