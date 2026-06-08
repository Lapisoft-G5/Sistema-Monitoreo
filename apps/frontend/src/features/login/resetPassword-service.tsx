import { useState } from 'react';
import { authApi } from '@shared/api/auth.api';

export const useResetPasswordService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { ok, error: apiError } = await authApi.resetPassword(token, newPassword);

    setLoading(false);

    if (!ok) {
      const errJson = (apiError || {}) as any;
      setError(errJson.message || 'Error al restablecer la contraseña.');
      return { success: false };
    }

    setSuccess(true);
    return { success: true };
  };

  return {
    resetPassword,
    loading,
    error,
    setError,
    success,
  };
};
