import { ResetPasswordWidget } from '@widgets/auth';

export const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg relative overflow-hidden">
      {/* Orbs de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] bg-primary -top-[150px] -left-[150px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] bg-primary-hover -bottom-[100px] -right-[100px]" />
      </div>

      <ResetPasswordWidget />
    </div>
  );
};
