import { useContext } from 'react';
import { CronogramaContext } from './cronograma-context';

export const useCronogramas = () => {
  const context = useContext(CronogramaContext);
  if (!context) {
    throw new Error('useCronogramas debe usarse dentro de un CronogramaProvider');
  }
  return context;
};
