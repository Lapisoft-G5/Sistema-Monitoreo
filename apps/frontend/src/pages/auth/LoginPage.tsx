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
  // Extraemos de useAuth los estados calculados de manera segura en el proveedor
  const { login, attempts, isPenalized, timeLeft, showFailedModal, setShowFailedModal } = useAuth();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  // Formateador de segundos a MM:SS
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

  if (isPenalized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a1931] font-sans">
        <div className="w-full max-w-[430px] bg-[#112240] border border-slate-700/60 rounded-2xl p-8 shadow-2xl text-center animate-fade-in">
          <div className="mb-4">
            {!logoError ? (
              <img
                src={LOGO_SRC}
                alt="Logo UGEL"
                onError={() => setLogoError(true)}
                className="w-16 h-16 mx-auto object-contain opacity-80"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center bg-blue-600">
                🛡️
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black text-white">UGEL Lampa</h1>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">Sistema de Monitoreo</p>

          <div className="bg-red-500/80 text-white text-xs font-bold tracking-widest py-2 px-6 rounded-full uppercase mb-6 inline-block w-full">
            Acceso de Sistema
          </div>

          <p className="text-[0.68rem] text-slate-400 font-bold tracking-wider uppercase mb-2">
            Tiempo de Penalización
          </p>

          <div className="bg-[#061124] border border-slate-700 rounded-xl py-3 px-6 text-3xl font-mono font-bold text-slate-200 tracking-widest mb-6 w-3/4 mx-auto">
            {formatTime(timeLeft)}
          </div>

          <p className="text-sm text-slate-300 px-2 leading-relaxed mb-8">
            La opción de inicio de sesión esta desactivada muchos intentos fallidos.
            <br />
            Intenta el inicio de sesión mas tarde
          </p>

          <span className="text-xs font-bold uppercase tracking-wider text-red-400/40 select-none">
            Bloqueado por Seguridad
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA ESTÁNDAR + MODAL AZUL DE INTENTOS
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a1931] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: '#1a3a8f',
            opacity: 0.15,
            filter: 'blur(120px)',
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
            background: '#1e4bd8',
            opacity: 0.1,
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
            <div className="w-[88px] h-[88px] rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 shadow-lg">
              <svg viewBox="0 0 64 64" fill="none" width="44" height="44">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path
                  d="M32 10 L54 46 H10 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="22" r="5" fill="white" opacity="0.9" />
                <rect x="27" y="38" width="10" height="9" rx="2" fill="white" opacity="0.8" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-black text-white tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-slate-400 mt-1">Sistema de Monitoreo</p>
        </div>

        <div className="w-full bg-[#112240] border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-5">
            <span className="bg-blue-600 text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
              Acceso de Sistema
            </span>
          </div>
          <p className="text-center text-xs text-slate-400 mb-6">
            Valide su credencial pedagógica digital para iniciar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Usuario
              </label>
              <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <span className="pl-3 text-slate-500">
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
                  className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-3"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
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
              <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <span className="pl-3 text-slate-500">
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
                  className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-3"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer bg-transparent border-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && !showFailedModal && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs animate-fade-in">
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
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 cursor-pointer disabled:cursor-not-allowed border-none"
            >
              {loading ? 'Verificando...' : 'INICIO DE SESIÓN'}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL EMERGENTE AZUL --- */}
      {showFailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[340px] bg-[#0052cc] rounded-xl p-6 text-center shadow-2xl border border-blue-400/20">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {attempts === 1 ? 'Primer intento fallido' : 'Segundo intento fallido'}
            </h3>
            <p className="text-sm text-blue-100 mb-6 font-medium">
              Le queda {MAX_ATTEMPTS - attempts}{' '}
              {MAX_ATTEMPTS - attempts === 1 ? 'intento' : 'intentos'}
            </p>
            <button
              onClick={() => setShowFailedModal(false)}
              className="w-full py-2.5 bg-[#071d49] hover:bg-[#0c2a66] text-white text-xs font-bold tracking-widest rounded-lg transition-colors border-none cursor-pointer uppercase"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
