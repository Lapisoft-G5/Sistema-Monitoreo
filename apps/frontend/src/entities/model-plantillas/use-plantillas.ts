import { useContext } from 'react';
import { PlantillasContext } from './context';

export const usePlantillas = () => {
  const context = useContext(PlantillasContext);
  if (!context) {
    throw new Error('usePlantillas must be used within a PlantillasProvider');
  }
  return context;
};
