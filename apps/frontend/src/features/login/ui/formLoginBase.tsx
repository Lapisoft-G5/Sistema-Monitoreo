import { useState } from 'react';
import { CreditCard, Lock, Eye, EyeOff } from 'lucide-react';

interface BaseLoginFormProps {
  onSubmit: (dni: string, password: string) => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

export const BaseLoginForm = ({ onSubmit, onForgotPassword, isLoading }: BaseLoginFormProps) => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Emitimos los datos puros hacia arriba
    onSubmit(dni, password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Campo Usuario */}
      <div>
        <label className="block text-slate-600 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
          Usuario
        </label>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#990537] focus-within:bg-white transition-colors">
          <span className="pl-3 text-slate-400">
            <CreditCard className="w-[17px] h-[17px]" strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Ingrese su DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
            maxLength={8}
            disabled={isLoading}
            className="w-full bg-transparent border-none outline-none text-slate-800 text-sm px-3 py-3 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-slate-600 text-[0.68rem] font-bold tracking-wider uppercase">
            Contraseña
          </label>
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            disabled={isLoading}
            className="text-[#990537] hover:text-[#7a042c] text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-semibold outline-none disabled:opacity-50"
          >
            {showPass ? (
              <EyeOff className="w-[14px] h-[14px]" />
            ) : (
              <Eye className="w-[14px] h-[14px]" />
            )}
            {showPass ? 'ocultar' : 'mostrar'}
          </button>
        </div>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#990537] focus-within:bg-white transition-colors">
          <span className="pl-3 text-slate-400">
            <Lock className="w-[17px] h-[17px]" strokeWidth={2} />
          </span>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent border-none outline-none text-slate-800 text-sm px-3 py-3 disabled:opacity-50"
          />
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-[#990537] hover:underline text-xs cursor-pointer bg-transparent border-none outline-none font-medium disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Botón de Envío (Integrado al form para disparar el onSubmit nativo) */}
      <button
        type="submit"
        disabled={isLoading || !dni.trim() || password.length < 6}
        className="w-full py-3.5 bg-[#990537] hover:bg-[#80042e] disabled:bg-[#990537]/50 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-md mt-2 cursor-pointer disabled:cursor-not-allowed border-none"
      >
        {isLoading ? 'Verificando...' : 'INICIO DE SESIÓN'}
      </button>
    </form>
  );
};
