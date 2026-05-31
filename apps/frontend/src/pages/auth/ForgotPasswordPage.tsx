import { useState } from 'react';

interface Props {
  onBack: () => void;
}

const LOGO_SRC = '/logo-ugel.png';

export const ForgotPasswordPage = ({ onBack }: Props) => {
  const [step, setStep] = useState<'form' | 'sent'>('form');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.length < 8) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep('sent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a1931] relative overflow-hidden">
      {/* Orbs de fondo suavizados idénticos al Login */}
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
          {/* Botón de retorno superior */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 text-xs hover:text-blue-300 transition-colors cursor-pointer bg-transparent border-none outline-none mb-5 p-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </button>

          {step === 'form' ? (
            <div>
              <div className="flex justify-center mb-4">
                <span className="bg-blue-600 text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
                  Recuperar Acceso
                </span>
              </div>

              <h2 className="text-white text-lg font-bold text-center mb-2">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-center text-xs text-slate-400 mb-6 leading-relaxed">
                Ingresa tu DNI y te enviaremos las instrucciones de restablecimiento al correo
                institucional o personal que registraste en el padrón.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Campo DNI */}
                <div>
                  <label className="block text-slate-400 text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                    DNI de Usuario
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

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={loading || dni.length < 8}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 disabled:text-slate-500 font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 cursor-pointer disabled:cursor-not-allowed border-none text-white"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="w-4 h-4 border-2 border-white/30 border-top-white rounded-full animate-spin"
                        style={{ borderTopColor: '#fff' }}
                      />
                      Enviando...
                    </span>
                  ) : (
                    'ENVIAR INSTRUCCIONES'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-2">
              {/* Icono de éxito alineado al color success global */}
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

              <h2 className="text-white text-xl font-bold mb-2">¡Instrucciones enviadas!</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Si el DNI <span className="text-blue-400 font-semibold">{dni}</span> se encuentra
                registrado de forma activa, recibirás un enlace de recuperación a la brevedad.
              </p>

              <button
                onClick={onBack}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 font-bold text-sm tracking-wider rounded-xl transition-all shadow-lg cursor-pointer border-none text-white"
              >
                VOLVER AL INICIO
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
