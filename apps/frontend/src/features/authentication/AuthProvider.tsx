import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { MOCK_USERS } from '../../entities/user';
import type { User } from '../../entities/user';

const MAX_ATTEMPTS = 3;
const PENALTY_TIME = 1800; // 30 minutos en segundos

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const penaltyExpiry = localStorage.getItem('ugel_penalty_expiry');
    if (penaltyExpiry) {
      const remaining = Math.ceil((parseInt(penaltyExpiry) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [isPenalized, setIsPenalized] = useState<boolean>(() => timeLeft > 0);
  const [attempts, setAttempts] = useState<number>(() => (timeLeft > 0 ? MAX_ATTEMPTS : 0));
  const [showFailedModal, setShowFailedModal] = useState<boolean>(false);

  useEffect(() => {
    if (!isPenalized) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Si el tiempo llegó a 1, el próximo paso es 0 (finalizar penalización)
        if (prev <= 1) {
          localStorage.removeItem('ugel_penalty_expiry');
          // Cambiamos los estados de manera asíncrona diferida para no bloquear el render actual
          setTimeout(() => {
            setIsPenalized(false);
            setAttempts(0);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPenalized]); // Únicamente depende de si está penalizado o no

  const login = async (dni: string, password: string) => {
    if (isPenalized) {
      return { success: false, error: 'Sistema penalizado temporalmente', isBlocked: true };
    }

    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS[dni];

    const isUserValid = found && (password === dni || password === 'Ugel2024!');

    if (!isUserValid) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        const expiryTime = Date.now() + PENALTY_TIME * 1000;
        localStorage.setItem('ugel_penalty_expiry', expiryTime.toString());
        setIsPenalized(true);
        setTimeLeft(PENALTY_TIME);
        setShowFailedModal(false);
        return {
          success: false,
          error: 'Demasiados intentos fallidos. Acceso bloqueado.',
          isBlocked: true,
        };
      } else {
        setShowFailedModal(true);
        return { success: false, error: found ? 'Contraseña incorrecta' : 'Usuario no encontrado' };
      }
    }

    // Login Exitoso
    setAttempts(0);
    localStorage.removeItem('ugel_penalty_expiry');
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
        attempts,
        isPenalized,
        timeLeft,
        showFailedModal,
        setShowFailedModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
