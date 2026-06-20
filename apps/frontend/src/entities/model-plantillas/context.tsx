import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Plantilla } from './model';
import { MOCK_PLANTILLAS } from './mocks';

export interface PlantillasContextType {
  plantillas: Plantilla[];
  setPlantillas: React.Dispatch<React.SetStateAction<Plantilla[]>>;
  addPlantilla: (plantilla: Plantilla) => void;
  updatePlantilla: (id: string, data: Partial<Plantilla>) => void;
  deletePlantilla: (id: string) => void;
  togglePlantillaEstado: (id: string) => void;
}

export const PlantillasContext = createContext<PlantillasContextType | undefined>(undefined);

export const PlantillasProvider = ({ children }: { children: ReactNode }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>(() => {
    const saved = localStorage.getItem('sistema-monitoreo:plantillas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_PLANTILLAS;
      }
    }
    return MOCK_PLANTILLAS;
  });

  useEffect(() => {
    localStorage.setItem('sistema-monitoreo:plantillas', JSON.stringify(plantillas));
  }, [plantillas]);

  const addPlantilla = useCallback((plantilla: Plantilla) => {
    setPlantillas((prev) => [...prev, plantilla]);
  }, []);

  const updatePlantilla = useCallback((id: string, data: Partial<Plantilla>) => {
    setPlantillas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deletePlantilla = useCallback((id: string) => {
    setPlantillas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePlantillaEstado = useCallback((id: string) => {
    setPlantillas((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        let nextEstado: Plantilla['estado'] = 'Vigente';
        if (p.estado === 'Vigente') nextEstado = 'Histórico';
        else if (p.estado === 'Histórico') nextEstado = 'Borrador';
        else nextEstado = 'Vigente';

        return { ...p, estado: nextEstado };
      })
    );
  }, []);

  return (
    <PlantillasContext.Provider
      value={{
        plantillas,
        setPlantillas,
        addPlantilla,
        updatePlantilla,
        deletePlantilla,
        togglePlantillaEstado,
      }}
    >
      {children}
    </PlantillasContext.Provider>
  );
};
