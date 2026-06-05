import { useState } from 'react';
import { useAuth } from '../../features/authentication/useAuth';

interface Props {
  onSuccess: () => void;
}

const validate = (p: string) => ({
  length: p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  number: /[0-9]/.test(p),
});

const LOGO_SRC = '/logo-ugel.png';

export const ResetPasswordPage = ({ onSuccess }: Props) => {
  const { resetPassword } = useAuth();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const rules = validate(pwd);
  const allValid = rules.length && rules.uppercase && rules.number;

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Enlace de recuperación inválido: token ausente.');
      return;
    }
    if (!allValid) {
      setError('La contraseña no cumple los requisitos de complejidad.');
      return;
    }
    if (pwd !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(token, pwd);
    setLoading(false);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || 'Error al restablecer la contraseña');
    }
  };

  const ruleItems = [
    { key: 'length' as const, label: 'Mínimo 8 caracteres' },
    { key: 'uppercase' as const, label: 'Al menos una mayúscula' },
    { key: 'number' as const, label: 'Al menos un número' },
  ];

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
        {/* Encabezado: Logo institucional */}
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

        {/* Card Contenedor Principal */}
        <div className="w-full bg-[#112240] border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
          {step === 'form' ? (
            <div>
              <div className="flex justify-center mb-4">
                <span className="bg-blue-600 text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
                  Nueva Contraseña
                </span>
              </div>

              <h2 className="text-white text-lg font-bold text-center mb-2">
                Restablecer Contraseña
              </h2>
              <p className="text-center text-xs text-slate-400 mb-6 leading-relaxed">
                Establece tu nueva contraseña de acceso. Asegúrate de cumplir con todos los requisitos de seguridad descritos a continuación.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Alerta de Error */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs leading-relaxed text-center animate-pulse">
                    {error}
                  </div>
                )}

                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <span className="pl-3 text-slate-500">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={show ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      required
                      className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="pr-3 text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer outline-none"
                    >
                      {show ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                    Confirmar nueva contraseña
                  </label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <span className="pl-3 text-slate-500">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={show ? 'text' : 'password'}
                      placeholder="Repita su contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-3"
                    />
                  </div>
                </div>

                {/* Reglas de Complejidad */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-2.5 mt-1">
                  <p className="text-[0.68rem] font-bold tracking-wider text-slate-400 uppercase mb-1">
                    Requisitos de seguridad
                  </p>
                  {ruleItems.map((item) => {
                    const valid = rules[item.key];
                    return (
                      <div key={item.key} className="flex items-center gap-2.5">
                        <span className={`flex items-center justify-center w-4.5 h-4.5 rounded-full border transition-all ${valid
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'border-slate-700 text-slate-600'
                          }`}>
                          {valid ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                          )}
                        </span>
                        <span className={`text-[0.72rem] transition-colors ${valid ? 'text-slate-300 font-medium' : 'text-slate-500'
                          }`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Botón de Guardado */}
                <button
                  type="submit"
                  disabled={loading || !allValid || !confirm}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 disabled:text-slate-500 font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 cursor-pointer disabled:cursor-not-allowed border-none text-white"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="w-4 h-4 border-2 border-white/30 border-top-white rounded-full animate-spin"
                        style={{ borderTopColor: '#fff' }}
                      />
                      Guardando...
                    </span>
                  ) : (
                    'RESTABLECER CONTRASEÑA'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/5">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="text-white text-xl font-bold mb-2">¡Contraseña restablecida!</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Tu contraseña ha sido actualizada exitosamente en el sistema. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>

              <button
                onClick={onSuccess}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg cursor-pointer border-none text-white"
              >
                INICIAR SESIÓN
              </button>
            </div>
          )}
        </div>

        <p className="text-slate-500 text-[0.7rem] mt-5">
          Plataforma de Desempeño Escolar © Puno, Perú 2024
        </p>
      </div>
    </div>
  );
};
