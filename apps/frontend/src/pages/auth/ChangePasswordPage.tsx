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

export const ChangePasswordPage = ({ onSuccess }: Props) => {
  const { changePassword, user } = useAuth();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const rules = validate(pwd);
  const allValid = rules.length && rules.uppercase && rules.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      setError('La contraseña no cumple los requisitos');
      return;
    }
    if (pwd !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    await changePassword(pwd);
    setLoading(false);
    onSuccess();
  };

  const ruleItems = [
    { key: 'length' as const, label: 'Mínimo 8 caracteres' },
    { key: 'uppercase' as const, label: 'Al menos una mayúscula' },
    { key: 'number' as const, label: 'Al menos un número' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg relative overflow-hidden">
      {/* Orbs de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] bg-primary -top-[150px] -left-[150px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] bg-primary-hover -bottom-[100px] -right-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center">
        {/* Logo institucional */}
        <div className="text-center mb-6">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="Logo UGEL Lampa"
              onError={() => setLogoError(true)}
              className="w-[88px] h-[88px] mx-auto mb-3 object-contain"
            />
          ) : (
            <div className="w-[88px] h-[88px] rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary shadow-lg">
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
          <h1 className="text-3xl font-black text-text tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-text-muted mt-1">Sistema de Monitoreo</p>
        </div>

        {/* Card */}
        <div className="w-full bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-center mb-5">
            <span className="bg-primary text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
              Actualizar Credencial
            </span>
          </div>

          <p className="text-center text-xs text-text-muted mb-6">
            Bienvenido/a, <span className="text-primary font-semibold">{user?.nombres}</span>. Por
            seguridad institucional, configure una nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nueva contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-text-muted text-[0.68rem] font-bold tracking-wider uppercase">
                  Nueva Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-primary hover:text-primary-hover text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {show ? (
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
                  {show ? 'ocultar' : 'mostrar'}
                </button>
              </div>
              <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="pl-3 text-text-dim flex items-center">
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
                  type={show ? 'text' : 'password'}
                  placeholder="Ingrese nueva contraseña"
                  value={pwd}
                  onChange={(e) => {
                    setPwd(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim"
                />
              </div>
            </div>

            {/* Reglas de seguridad */}
            <div className="bg-bg border border-border rounded-xl p-3.5 flex flex-col gap-2.5">
              {ruleItems.map((r) => (
                <div
                  key={r.key}
                  className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                    rules[r.key] ? 'text-success' : 'text-text-dim'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 ${
                      rules[r.key] ? 'bg-success scale-110' : 'bg-transparent border border-border'
                    }`}
                  />
                  {r.label}
                </div>
              ))}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="pl-3 text-text-dim flex items-center">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Repita la contraseña"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-xs">
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

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading || !allValid}
              className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                'GUARDAR CONTRASEÑA'
              )}
            </button>
          </form>
        </div>

        <p className="text-text-dim text-[0.7rem] mt-5">
          Plataforma de Desempeño Escolar © Puno, Perú 2024
        </p>
      </div>
    </div>
  );
};
