import { useState } from 'react';
import { useAuth } from '../../features/authentication/useAuth';

interface Props {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
  onChangePassword: () => void;
}

const LOGO_SRC = '/logo-ugel.png';
const MAX_ATTEMPTS = 3;

export const LoginPage = ({ onForgotPassword }: Props) => {
  const { login, attempts, isPenalized, timeLeft, showFailedModal, setShowFailedModal } = useAuth();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || !password) {
      setError('Complete todos los campos');
      return;
    }
    setLoading(true);
    setError('');

    const result = await login(dni, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Error al iniciar sesión');
    }
  };

  // ==========================================
  // VISTA DE PENALIZACIÓN (COLOR CLARO VIVO)
  // ==========================================
  if (isPenalized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] font-sans">
        <div className="w-full max-w-[430px] bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center animate-fade-in">
          <div className="mb-4">
            {!logoError ? (
              <img
                src={LOGO_SRC}
                alt="Logo UGEL"
                onError={() => setLogoError(true)}
                className="w-16 h-16 mx-auto object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center bg-[#990537] text-white">
                🛡️
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-800">UGEL Lampa</h1>
          <p className="text-xs text-slate-500 mt-0.5 mb-6">Sistema de Monitoreo</p>

          <div className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold tracking-widest py-2.5 px-6 rounded-full uppercase mb-6 inline-block w-full">
            Acceso de Sistema
          </div>

          <p className="text-[0.68rem] text-slate-500 font-bold tracking-wider uppercase mb-2">
            Tiempo de Penalización
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-6 text-3xl font-mono font-bold text-red-500 tracking-widest mb-6 w-3/4 mx-auto shadow-inner">
            {formatTime(timeLeft)}
          </div>

          <p className="text-sm text-slate-600 px-2 leading-relaxed mb-8">
            La opción de inicio de sesión está desactivada por muchos intentos fallidos.
            <br />
            Intente el inicio de sesión más tarde
          </p>

          <span className="text-xs font-bold uppercase tracking-wider text-red-600/60 select-none bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            Bloqueado por Seguridad
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA ESTÁNDAR (COLOR CLARO VIVO)
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f1f5f9] relative overflow-hidden">
      {/* Destellos sutiles de fondo usando la nueva identidad */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: '#990537',
            opacity: 0.06,
            filter: 'blur(100px)',
            top: -150,
            left: -150,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: '#0284c7',
            opacity: 0.06,
            filter: 'blur(100px)',
            bottom: -100,
            right: -100,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center">
        <div className="text-center mb-6">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="Logo UGEL Lampa"
              onError={() => setLogoError(true)}
              className="w-[88px] h-[88px] mx-auto mb-3 object-contain"
            />
          ) : (
            <div className="w-[88px] h-[88px] rounded-2xl mx-auto mb-3 flex items-center justify-center bg-[#990537] shadow-md text-white font-bold text-xl">
              UGEL
            </div>
          )}
          <h1 className="text-3xl font-black text-slate-800 tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-slate-500 mt-1">Sistema de Monitoreo</p>
        </div>

        {/* Tarjeta del contenedor principal en Blanco Puro */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-5">
            <span className="bg-[#990537] text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase shadow-sm">
              Acceso de Sistema
            </span>
          </div>
          <p className="text-center text-xs text-slate-500 mb-6">
            Valide su credencial pedagógica digital para iniciar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-600 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Usuario
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#990537] focus-within:bg-white transition-colors">
                <span className="pl-3 text-slate-400">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Ingrese su DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-sm px-3 py-3"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-600 text-[0.68rem] font-bold tracking-wider uppercase">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-[#990537] hover:text-[#7a042c] text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-semibold"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {showPass ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                  {showPass ? 'ocultar' : 'mostrar'}
                </button>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#990537] focus-within:bg-white transition-colors">
                <span className="pl-3 text-slate-400">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-sm px-3 py-3"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[#990537] hover:underline text-xs cursor-pointer bg-transparent border-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && !showFailedModal && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs animate-fade-in font-medium">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#990537] hover:bg-[#80042e] disabled:bg-[#990537]/50 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-md mt-2 cursor-pointer disabled:cursor-not-allowed border-none"
            >
              {loading ? 'Verificando...' : 'INICIO DE SESIÓN'}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL EMERGENTE AZUL CIELO VIVO --- */}
      {showFailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-[340px] bg-[#0284c7] rounded-xl p-6 text-center shadow-2xl border border-sky-300/20">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-white text-xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {attempts === 1 ? 'Primer intento fallido' : 'Segundo intento fallido'}
            </h3>
            <p className="text-sm text-sky-50 mb-6 font-medium">
              Le queda {MAX_ATTEMPTS - attempts}{' '}
              {MAX_ATTEMPTS - attempts === 1 ? 'intento' : 'intentos'}
            </p>
            <button
              onClick={() => setShowFailedModal(false)}
              className="w-full py-2.5 bg-[#034d75] hover:bg-[#023b5a] text-white text-xs font-bold tracking-widest rounded-lg transition-colors border-none cursor-pointer uppercase"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
