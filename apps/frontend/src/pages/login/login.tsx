import { LoginCardWidget } from '@/widgets/auth/';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {/* La página solo centra el widget en la pantalla */}
      <LoginCardWidget />
    </div>
  );
};