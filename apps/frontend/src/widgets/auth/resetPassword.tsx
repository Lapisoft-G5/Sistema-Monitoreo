import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Card, CardContent } from '@shared/ui/card';
import { useResetPasswordService } from '@features/login/resetPassword-service';
import { ResetPasswordForm } from '@features/login/ui/formResetPasswordBase';

const LOGO_SRC = '/logo-ugel.png';

export const ResetPasswordWidget = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { resetPassword, loading, error, setError, success } = useResetPasswordService();
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (pwd: string) => {
    if (!token) {
      setError('Enlace de recuperación inválido: token ausente.');
      return;
    }
    await resetPassword(token, pwd);
  };

  const handleCustomError = (msg: string) => {
    setError(msg);
  };

  return (
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
          {!success ? (
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

              <ResetPasswordForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                onErrorChange={handleCustomError}
              />
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
  );
};
