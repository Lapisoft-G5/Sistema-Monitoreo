import { useContext } from 'react';
import { PlantillasContext } from './context.js';

/**
 * Hook de compat: usa el context local (localStorage) para mantener
 * compatibilidad con los componentes existentes. La migracion a
 * TanStack Query esta en use-plantillas-api.ts (TODO: migrar paginas).
 */
export const usePlantillas = () => {
  const context = useContext(PlantillasContext);
  if (!context) {
    throw new Error('usePlantillas must be used within a PlantillasProvider');
  }
  return context;
};
