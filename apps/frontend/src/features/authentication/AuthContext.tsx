import { createContext } from 'react';
import type { User } from '../../entities/user';

export interface AuthContextType {
  user: User | null;
  requiresPasswordChange: boolean;

  // Login unificado: Retorna tanto el control de UI local como la data de bloqueo del servidor
  login: (
    dni: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    isBlocked?: boolean;                  // Origen: feature branch (UI lock)
    lockedUntil?: string | null;          // Origen: develop (Backend lock timestamp)
    failedLoginAttempts?: number | null;  // Origen: develop
    remainingAttempts?: number | null;    // Origen: develop
  }>;

  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  
  // Métodos de recuperación de cuenta (Origen: develop)
  forgotPassword: (dni: string, email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  isAuthenticated: boolean;

  // Estados Globales de Seguridad para manejo de penalizaciones en UI (Origen: feature branch)
  attempts: number;            // Contador actual de fallos (0, 1, 2, 3)
  isPenalized: boolean;        // Controla si se activa la pantalla roja de bloqueo temporal
  timeLeft: number;            // Segundero de la cuenta regresiva (en segundos)
  showFailedModal: boolean;    // Controla la visibilidad del modal azul de advertencia
  setShowFailedModal: (show: boolean) => void; // Permite cerrar el modal con el botón "OK"
}

// Al exportar SOLO el contexto, ESLint no se queja
export const AuthContext = createContext<AuthContextType | null>(null);