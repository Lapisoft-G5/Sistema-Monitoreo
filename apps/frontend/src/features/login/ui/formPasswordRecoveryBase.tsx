import { useState } from 'react';
import { CreditCard, Mail } from 'lucide-react';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';

interface ForgotPasswordFormProps {
  onSubmit: (dni: string, email: string) => void;
  loading: boolean;
  error: string | null;
}

export const ForgotPasswordForm = ({ onSubmit, loading, error }: ForgotPasswordFormProps) => {
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(dni, email);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Alerta de Error integrada con diseño unificado */}
      {error && (
        <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs leading-relaxed text-center animate-pulse">
          {error}
        </div>
      )}

      {/* Campo DNI */}
      <div>
        <Label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
          DNI de Usuario
        </Label>
        <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <span className="pl-3 text-text-dim flex items-center">
            <CreditCard className="w-[17px] h-[17px]" strokeWidth={2} />
          </span>
          <Input
            type="text"
            placeholder="Ingrese su DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
            maxLength={8}
            disabled={loading}
            className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
          />
        </div>
      </div>

      {/* Campo Correo Electrónico */}
      <div>
        <Label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
          Correo Electrónico
        </Label>
        <div className="flex items-center bg-bg border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <span className="pl-3 text-text-dim flex items-center">
            <Mail className="w-[17px] h-[17px]" strokeWidth={2} />
          </span>
          <Input
            type="email"
            placeholder="Ingrese su correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full bg-transparent border-none outline-none text-text text-sm px-3 py-3 placeholder:text-text-dim shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
          />
        </div>
      </div>

      {/* Botón de Envío */}
      <Button
        type="submit"
        disabled={loading || dni.length < 8 || !email}
        className="w-full py-6 mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm h-auto"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </span>
        ) : (
          'ENVIAR INSTRUCCIONES'
        )}
      </Button>
    </form>
  );
};
