import { AlertCircle } from 'lucide-react';
import { BaseLoginForm } from '@features/login/ui/formLoginBase';
import { useLoginService } from '@features/login/login-service';
import { useNavigate } from 'react-router-dom';
import { LoginFailedModal } from './loginFailedModal';

const LOGO_SRC = '/logo-ugel.png';

export const LoginCardWidget = () => {
  const navigate = useNavigate();
  
  const {
    login,
    loading,
    error,
    showFailedModal,
    setShowFailedModal,
    attempts,
    MAX_ATTEMPTS,
  } = useLoginService();

  const handleLoginSubmit = async (dni: string, password: string) => {
    const result = await login(dni, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <>
      <div className="w-full max-w-[400px]">
        {/* Encabezado Visual */}
        <div className="text-center mb-6">
          <img
            src={LOGO_SRC}
            alt="Logo UGEL Lampa"
            className="w-[88px] h-[88px] mx-auto mb-3 object-contain"
          />
          <h1 className="text-3xl font-black text-slate-800 tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-slate-500 mt-1">Sistema de Monitoreo</p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-5">
            <span className="bg-[#990537] text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase shadow-sm">
              Acceso de Sistema
            </span>
          </div>
          
          <BaseLoginForm 
            onSubmit={handleLoginSubmit}
            onForgotPassword={() => navigate('/recuperar-password')}
            isLoading={loading}
          />

          {error && !showFailedModal && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs animate-fade-in font-medium mt-4">
              <AlertCircle className="w-[15px] h-[15px]" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>
      </div>

      <LoginFailedModal 
        isOpen={showFailedModal}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        onClose={() => setShowFailedModal(false)}
      />
    </>
  );
};