import { LoginCardWidget } from '@/widgets/auth/';
import { useUser } from '@entities/model-user';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {/* La página solo centra el widget en la pantalla */}
      <LoginCardWidget />
    </div>
  );
};