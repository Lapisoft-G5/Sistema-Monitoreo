import { useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { MOCK_USERS } from '../../entities/user';
import type { User } from '../../entities/user';

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
