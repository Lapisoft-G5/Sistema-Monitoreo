import { useState } from 'react';
import { authApi } from '@shared/api/auth.api';

export const usePasswordRecoveryService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const recoverPassword = async (dni: string, email: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { ok, error: apiError } = await authApi.forgotPassword(dni, email);
    
    setLoading(false);

    if (!ok) {
      const errJson = (apiError || {}) as { message?: string };
      setError(errJson.message || 'No se pudo procesar la solicitud. Verifique sus datos.');
      return { success: false };
    }

    setSuccessMessage('Se han enviado las instrucciones a su correo electrónico.');
    return { success: true };
  };

  return {
    recoverPassword,
    loading,
    error,
    successMessage
  };
};