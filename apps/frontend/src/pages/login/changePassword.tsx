import { useState } from 'react';
import { useUser } from '@entities/model-user';
import { Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { LogoUgelIcon } from '@shared/assets/icons/LogoUgelIcon';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';
import { Card, CardContent } from '@shared/ui/card';

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
  const { changePassword, user } = useUser();
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
    setError('');

    try {
      await changePassword(pwd);
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar la nueva contraseña';
      setError(errorMsg);
    } finally {
      setLoading(false);
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
            <div className="w-[88px] h-[88px] rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary shadow-lg">
              <LogoUgelIcon className="w-11 h-11 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-black text-text tracking-wide">UGEL Lampa</h1>
          <p className="text-xs text-text-muted mt-1">Sistema de Monitoreo</p>
        </div>

        {/* Card Contenedor Principal */}
        <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-8">
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
              {/* Campo: Nueva Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="text-text-muted text-[0.68rem] font-bold tracking-wider uppercase">
                    Nueva Contraseña
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShow((s) => !s)}
                    className="text-primary hover:text-primary-hover hover:bg-transparent text-xs flex items-center gap-1.5 cursor-pointer p-0 h-auto font-normal"
                  >
                    {show ? (
                      <EyeOff className="w-[14px] h-[14px]" strokeWidth={2} />
                    ) : (
                      <Eye className="w-[14px] h-[14px]" strokeWidth={2} />
                    )}
                    {show ? 'ocultar' : 'mostrar'}
                  </Button>
                </div>
                <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <span className="pl-3 text-text-dim flex items-center">
                    <Lock className="w-[17px] h-[17px]" strokeWidth={2} />
                  </span>
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="Ingrese nueva contraseña"
                    value={pwd}
                    onChange={(e) => {
                      setPwd(e.target.value);
                      setError('');
                    }}
                    className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                  />
                </div>
              </div>

              {/* Panel Dinámico de Reglas de Seguridad */}
              <div className="bg-bg border border-border rounded-xl p-3.5 flex flex-col gap-2.5">
                {ruleItems.map((r) => {
                  const isValid = rules[r.key];
                  return (
                    <div
                      key={r.key}
                      className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                        isValid ? 'text-success' : 'text-text-dim'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 ${
                          isValid ? 'bg-success scale-110' : 'bg-transparent border border-border'
                        }`}
                      />
                      {r.label}
                    </div>
                  );
                })}
              </div>

              {/* Campo: Confirmar Contraseña */}
              <div>
                <Label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                  Confirmar Contraseña
                </Label>
                <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <span className="pl-3 text-text-dim flex items-center">
                    <Shield className="w-[17px] h-[17px]" strokeWidth={2} />
                  </span>
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="Repita la contraseña"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError('');
                    }}
                    className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                  />
                </div>
              </div>

              {/* Alerta de Error */}
              {error && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-xs animate-pulse">
                  <AlertCircle className="w-[15px] h-[15px]" strokeWidth={2} />
                  {error}
                </div>
              )}

              {/* Botón de Envío */}
              <Button
                type="submit"
                disabled={loading || !allValid}
                className="w-full py-6 mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm h-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  'GUARDAR CONTRASEÑA'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-text-dim text-[0.7rem] mt-5">
          Plataforma de Desempeño Escolar © Puno, Perú 2024
        </p>
      </div>
    </div>
  );
};
