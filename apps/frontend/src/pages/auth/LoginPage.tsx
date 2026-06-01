import { useState, useEffect } from 'react';
import { useAuth } from '../../features/authentication/useAuth';

interface Props {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
  onChangePassword: () => void;
}

const LOGO_SRC = '/logo-ugel.png';

export const LoginPage = ({ onForgotPassword }: Props) => {
  const { login } = useAuth();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setError('');
      setFailedLoginAttempts(null);
      setRemainingAttempts(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown !== null) return;
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
      setFailedLoginAttempts(result.failedLoginAttempts ?? null);
      setRemainingAttempts(result.remainingAttempts ?? null);
      if (result.lockedUntil) {
        const lockedTime = new Date(result.lockedUntil).getTime();
        const diff = Math.ceil((lockedTime - Date.now()) / 1000);
        if (diff > 0) {
          setCountdown(diff);
        }
      }
    } else {
      setFailedLoginAttempts(null);
      setRemainingAttempts(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a1931] relative overflow-hidden">
      {/* Orbs de fondo suavizados */}
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
        {/* Logo + título */}
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

        {/* Card contenedor plano y serio */}
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
            {/* Usuario */}
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

            {/* Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none"
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
                  className="text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer bg-transparent border-none outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex flex-col gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs transition-all">
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{countdown !== null ? `${error} (Intente de nuevo en ${formatTime(countdown)})` : error}</span>
                </div>
                {failedLoginAttempts !== null && remainingAttempts !== null && remainingAttempts > 0 && (
                  <div className="mt-1 text-slate-300 border-t border-red-500/20 pt-2 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[0.7rem]">
                      <span>Intentos fallidos:</span>
                      <span className="font-bold text-red-400">{failedLoginAttempts} / 3</span>
                    </div>
                    <div className="flex justify-between items-center text-[0.7rem]">
                      <span>Intentos restantes antes del bloqueo:</span>
                      <span className="font-bold text-emerald-400">{remainingAttempts} {remainingAttempts === 1 ? 'intento' : 'intentos'}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-red-500 h-1.5 transition-all duration-500"
                        style={{ width: `${(failedLoginAttempts / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || countdown !== null}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 cursor-pointer disabled:cursor-not-allowed border-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-top-white rounded-full animate-spin"
                    style={{ borderTopColor: '#fff' }}
                  />
                  Verificando...
                </span>
              ) : countdown !== null ? (
                'CUENTA BLOQUEADA TEMPORALMENTE'
              ) : (
                'INICIO DE SESIÓN'
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-[0.72rem] mt-5">
            Demo: DNI <span className="text-slate-400 font-semibold">76358911</span> · contraseña =
            DNI
          </p>
        </div>

        <p className="text-slate-500 text-[0.7rem] mt-5">
          Plataforma de Desempeño Escolar © Puno, Perú 2024
        </p>
      </div>
    </div>
  );
};
