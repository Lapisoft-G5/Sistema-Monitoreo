import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../../entities/user';
import { MOCK_USERS } from '../../entities/user';

interface AuthContextType {
  user: User | null;
  requiresPasswordChange: boolean;
  login: (dni: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const login = async (dni: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS[dni];
    if (!found) return { success: false, error: 'Usuario no encontrado' };
    if (password !== dni && password !== 'Ugel2024!') {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    const isFirstLogin = password === dni;
    setRequiresPasswordChange(isFirstLogin);
    setUser(found);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setRequiresPasswordChange(false);
  };

  const changePassword = async (newPassword: string) => {
    await new Promise((r) => setTimeout(r, 500));
    // Se utiliza la variable para evitar alertas de ESLint si no se modifica el mock por ahora
    console.log('Actualizando contraseña a:', newPassword.substring(0, 2) + '...');
    if (user) setUser({ ...user, firstLogin: false });
    setRequiresPasswordChange(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        requiresPasswordChange,
        login,
        logout,
        changePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
