import { useState } from 'react';
import { AuthProvider } from '../features/authentication/AuthProvider';
import { useAuth } from '../features/authentication/useAuth';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AppShell } from './AppShell';

type UnauthView = 'login' | 'forgot-password';

const AuthRouter = () => {
  const { isAuthenticated, requiresPasswordChange } = useAuth();
  const [view, setView] = useState<UnauthView>('login');

  // Detectar token en URL para el flujo de restablecimiento de contraseña
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          // Limpiar el parámetro token de la URL tras el cambio exitoso
          window.history.replaceState({}, document.title, window.location.pathname);
          setView('login');
        }}
      />
    );
  }

  if (isAuthenticated && requiresPasswordChange) {
    return <ChangePasswordPage onSuccess={() => {}} />;
  }

  if (isAuthenticated) {
    return <AppShell />;
  }

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
