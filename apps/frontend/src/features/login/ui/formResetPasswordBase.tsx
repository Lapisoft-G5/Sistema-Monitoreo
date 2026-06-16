import { useState } from 'react';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';

const validate = (p: string) => ({
  length: p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  number: /[0-9]/.test(p),
});

interface ResetPasswordFormProps {
  onSubmit: (pwd: string) => void;
  loading: boolean;
  error: string | null;
  onErrorChange: (err: string) => void;
}

export const ResetPasswordForm = ({
  onSubmit,
  loading,
  error,
  onErrorChange,
}: ResetPasswordFormProps) => {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);

  const rules = validate(pwd);
  const allValid = rules.length && rules.uppercase && rules.number;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      onErrorChange('La contraseña no cumple los requisitos de complejidad.');
      return;
    }
    if (pwd !== confirm) {
      onErrorChange('Las contraseñas no coinciden.');
      return;
    }
    onSubmit(pwd);
  };

  const ruleItems = [
    { key: 'length' as const, label: 'Mínimo 8 caracteres' },
    { key: 'uppercase' as const, label: 'Al menos una mayúscula' },
    { key: 'number' as const, label: 'Al menos un número' },
  ];

  return (
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
              onErrorChange('');
            }}
            required
            disabled={loading}
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
              onErrorChange('');
            }}
            required
            disabled={loading}
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
  );
};
