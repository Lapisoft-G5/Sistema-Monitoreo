import { AlertCircle } from 'lucide-react';

interface LoginFailedModalProps {
  isOpen: boolean;
  attempts: number;
  maxAttempts: number;
  onClose: () => void;
}

export const LoginFailedModal = ({
  isOpen,
  attempts,
  maxAttempts,
  onClose,
}: LoginFailedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-[340px] bg-[#0284c7] rounded-xl p-6 text-center shadow-2xl border border-sky-300/20 transform transition-all">
        {/* Icono de Alerta */}
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-white">
          <AlertCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Título dinámico según el intento */}
        <h3 className="text-xl font-bold text-white mb-2">
          {attempts === 1 ? 'Primer intento fallido' : 'Segundo intento fallido'}
        </h3>

        {/* Contador de intentos restantes */}
        <p className="text-sm text-sky-50 mb-6 font-medium">
          Le queda {maxAttempts - attempts} {maxAttempts - attempts === 1 ? 'intento' : 'intentos'}
        </p>

        {/* Botón de Confirmación */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#034d75] hover:bg-[#023b5a] text-white text-xs font-bold tracking-widest rounded-lg transition-colors border-none cursor-pointer uppercase outline-none"
        >
          OK
        </button>
      </div>
    </div>
  );
};