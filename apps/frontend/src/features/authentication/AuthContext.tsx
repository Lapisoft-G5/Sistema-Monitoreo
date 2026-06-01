import { createContext } from 'react';
import type { User } from '../../entities/user';

export interface AuthContextType {
  user: User | null;
  requiresPasswordChange: boolean;

  // 1. Modificado: El login ahora retorna explícitamente si se debe bloquear la UI
  login: (
    dni: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; isBlocked?: boolean }>;

  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;

  // 2. Nuevos Estados Globales de Seguridad
  attempts: number; // Contador actual de fallos (0, 1, 2, 3)
  isPenalized: boolean; // Controla si se activa la pantalla roja
  timeLeft: number; // Segundero de la cuenta regresiva (en segundos)
  showFailedModal: boolean; // Controla la visibilidad del modal azul
  setShowFailedModal: (show: boolean) => void; // Permite cerrar el modal azul con el botón "OK"
}

// Al exportar SOLO el contexto, ESLint no se queja
export const AuthContext = createContext<AuthContextType | null>(null);
