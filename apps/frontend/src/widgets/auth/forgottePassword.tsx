import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/button';
import { Card, CardContent } from '@shared/ui/card';
import { usePasswordRecoveryService } from '@features/login/passwordRecovery-service';
import { ForgotPasswordForm } from '@features/login/ui/formPasswordRecoveryBase';

const LOGO_SRC = '/logo-ugel.png';

export const ForgotPasswordWidget = () => {
  const navigate = useNavigate();
  const { recoverPassword, loading, error, successMessage } = usePasswordRecoveryService();
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (dni: string, email: string) => {
    // El servicio se encarga de cambiar el successMessage si todo sale bien
    await recoverPassword(dni, email);
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

      {/* Card Contenedor Principal Semántico */}
      <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-8">
          {/* Botón de retorno superior */}
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-primary hover:text-primary-hover hover:bg-transparent text-xs transition-colors cursor-pointer mb-5 p-0 h-auto"
          >
            <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={2.5} />
            Volver al inicio de sesión
          </Button>

          {/* Validamos si el servicio nos devolvió un mensaje de éxito para cambiar la vista */}
          {!successMessage ? (
            <div>
              <div className="flex justify-center mb-4">
                <span className="bg-primary text-white text-[0.72rem] font-bold tracking-widest px-6 py-2 rounded-full uppercase">
                  Recuperar Acceso
                </span>
              </div>

              <h2 className="text-text text-lg font-bold text-center mb-2">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-center text-xs text-text-muted mb-6 leading-relaxed">
                Ingresa tu DNI y tu Correo electrónico registrado para enviarte las instrucciones de
                restablecimiento.
              </p>

              <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
            </div>
          ) : (
            <div className="text-center py-2">
              {/* Icono de éxito alineado al color success global */}
              <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 className="w-[28px] h-[28px] text-success" strokeWidth={2.5} />
              </div>

              <h2 className="text-text text-xl font-bold mb-2">¡Instrucciones enviadas!</h2>
              <p className="text-text-muted text-xs leading-relaxed mb-6">
                Si los datos ingresados corresponden a un usuario activo, recibirás un correo de
                recuperación a la brevedad.
              </p>

              <Button
                onClick={() => navigate('/login')}
                className="w-full py-6 bg-primary hover:bg-primary-hover text-white font-bold text-sm tracking-wider rounded-xl border-none cursor-pointer transition-all shadow-sm h-auto"
              >
                VOLVER AL INICIO
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
