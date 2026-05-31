import { createContext } from 'react';
import type { User } from '../../entities/user';

interface AuthContextType {
  user: User | null;
  requiresPasswordChange: boolean;
  login: (dni: string, password: string) => Promise<{ success: boolean; error?: string; lockedUntil?: string | null }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  forgotPassword: (dni: string, email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
