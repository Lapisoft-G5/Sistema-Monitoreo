import { useContext } from 'react';
import { CronogramaContext } from './cronograma-context.js';

/**
 * Hook de compat: usa el context local (localStorage) para mantener
 * compatibilidad con los componentes existentes. La migracion a
 * TanStack Query esta en use-cronogramas-api.ts (TODO: migrar paginas).
 */
export const useCronogramas = () => {
  const context = useContext(CronogramaContext);
  if (!context) {
    throw new Error('useCronogramas debe usarse dentro de un CronogramaProvider');
  }
  return context;
};
