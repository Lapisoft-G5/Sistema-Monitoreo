import { useState } from 'react';
import { AuthProvider } from '../features/authentication/AuthProvider';
import { useAuth } from '../features/authentication/useAuth';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AppShell } from './AppShell';

type UnauthView = 'login' | 'forgot-password';

const AuthRouter = () => {
  const { isAuthenticated, requiresPasswordChange } = useAuth();
  const [view, setView] = useState<UnauthView>('login');

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
