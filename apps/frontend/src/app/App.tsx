import { useAuth } from '../features/authentication/useAuth';
import { AuthProvider } from '../features/authentication/AuthProvider';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AppShell } from './AppShell';
import { useState } from 'react';

type AuthView = 'login' | 'forgot-password';

const AuthRouter = () => {
  const { isAuthenticated, requiresPasswordChange } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  // 1. Autenticado y sin necesidad de cambiar contraseña → app principal
  if (isAuthenticated && !requiresPasswordChange) return <AppShell />;

  // 2. Autenticado pero primer login → forzar cambio de contraseña
  if (isAuthenticated && requiresPasswordChange) {
    return <ChangePasswordPage onSuccess={() => {}} />;
  }

  // 3. No autenticado → flujo de login
  if (view === 'forgot-password') {
    return <ForgotPasswordPage onBack={() => setView('login')} />;
  }

  return (
    <LoginPage
      onLoginSuccess={() => {}}
      onForgotPassword={() => setView('forgot-password')}
      onChangePassword={() => {}}
    />
  );
};

export const App = () => (
  <AuthProvider>
    <AuthRouter />
  </AuthProvider>
);
