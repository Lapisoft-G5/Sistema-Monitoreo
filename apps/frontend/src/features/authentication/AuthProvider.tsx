import { useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../../entities/user';
import type { ILoginResponse } from '@sistema-monitoreo/shared-contracts';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

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

  const logout = () => {
    localStorage.removeItem('accessToken');
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
