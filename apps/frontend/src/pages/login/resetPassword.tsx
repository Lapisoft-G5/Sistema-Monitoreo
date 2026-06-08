import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';
import { Card, CardContent } from '@shared/ui/card';
import { authApi } from '@shared/api/auth.api';

const validate = (p: string) => ({
  length: p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  number: /[0-9]/.test(p),
});

const LOGO_SRC = '/logo-ugel.png';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const rules = validate(pwd);
  const allValid = rules.length && rules.uppercase && rules.number;

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

    const { ok, error: apiError } = await authApi.resetPassword(token, pwd);

    setLoading(false);

    if (ok) {
      setStep('success');
    } else {
      const errJson = (apiError || {}) as any;
      setError(errJson.message || 'Error al restablecer la contraseña.');
    }
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
            <div className="w-[88px] h-[88px] rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary shadow-lg text-white">
              <ShieldAlert className="w-11 h-11" />
            </div>
          )}
          <h1 className="text-3xl font-black text-text tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-text-muted mt-1">Sistema de Monitoreo</p>
        </div>

        {/* Card Contenedor Principal */}
        <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-8">
            {step === 'form' ? (
              <div>
                <div className="flex justify-center mb-4">
                  <span className="bg-primary text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
                    Nueva Contraseña
                  </span>
                </div>

                <h2 className="text-text text-lg font-bold text-center mb-2">
                  Restablecer Contraseña
                </h2>
                <p className="text-center text-xs text-text-muted mb-6 leading-relaxed">
                  Establece tu nueva contraseña de acceso. Asegúrate de cumplir con todos los requisitos de seguridad descritos a continuación.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Alerta de Error */}
                  {error && (
                    <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs leading-relaxed text-center animate-pulse">
                      {error}
                    </div>
                  )}

                  {/* Nueva Contraseña */}
                  <div>
                    <Label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                      Nueva contraseña
                    </Label>
                    <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <span className="pl-3 text-text-dim flex items-center">
                        <Lock className="w-[17px] h-[17px]" strokeWidth={2} />
                      </span>
                      <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={pwd}
                        onChange={(e) => {
                          setPwd(e.target.value);
                          setError('');
                        }}
                        required
                        className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShow(!show)}
                        className="pr-3 text-text-dim hover:text-text hover:bg-transparent transition-colors cursor-pointer outline-none flex items-center justify-center p-0 h-auto font-normal"
                      >
                        {show ? (
                          <EyeOff className="w-[17px] h-[17px]" />
                        ) : (
                          <Eye className="w-[17px] h-[17px]" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <Label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                      Confirmar nueva contraseña
                    </Label>
                    <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <span className="pl-3 text-text-dim flex items-center">
                        <Lock className="w-[17px] h-[17px]" strokeWidth={2} />
                      </span>
                      <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Repita su contraseña"
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setError('');
                        }}
                        required
                        className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                      />
                    </div>
                  </div>

                  {/* Reglas de Complejidad */}
                  <div className="bg-bg border border-border rounded-xl p-3.5 flex flex-col gap-2.5 mt-1">
                    <p className="text-[0.68rem] font-bold tracking-wider text-text-muted uppercase mb-1">
                      Requisitos de seguridad
                    </p>
                    {ruleItems.map((item) => {
                      const valid = rules[item.key];
                      return (
                        <div key={item.key} className="flex items-center gap-2.5">
                          <span
                            className={`flex items-center justify-center w-4.5 h-4.5 rounded-full border transition-all ${
                              valid
                                ? 'bg-success/10 border-success/30 text-success'
                                : 'border-border text-text-dim'
                            }`}
                          >
                            {valid ? (
                              <Check className="w-[10px] h-[10px]" strokeWidth={3} />
                            ) : (
                              <span className="w-1 h-1 rounded-full bg-text-dim" />
                            )}
                          </span>
                          <span
                            className={`text-[0.72rem] transition-colors ${
                              valid ? 'text-text font-medium' : 'text-text-dim'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón de Guardado */}
                  <Button
                    type="submit"
                    disabled={loading || !allValid || !confirm}
                    className="w-full py-6 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm mt-2 h-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      'RESTABLECER CONTRASEÑA'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <CheckCircle2 className="w-[28px] h-[28px] text-success" strokeWidth={2.5} />
                </div>

                <h2 className="text-text text-xl font-bold mb-2">¡Contraseña restablecida!</h2>
                <p className="text-text-muted text-xs leading-relaxed mb-6">
                  Tu contraseña ha sido actualizada exitosamente en el sistema. Ya puedes iniciar sesión con tus nuevas credenciales.
                </p>

                <Button
                  onClick={() => navigate('/login')}
                  className="w-full py-6 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer transition-all shadow-sm h-auto"
                >
                  INICIAR SESIÓN
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-text-dim text-[0.7rem] mt-5">
          Plataforma de Desempeño Escolar © Puno, Perú 2024
        </p>
      </div>
    </div>
  );
};
