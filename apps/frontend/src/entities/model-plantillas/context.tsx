/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { plantillasApi } from './api/plantillas.api.js';
import type { Plantilla } from './model';
import { MOCK_PLANTILLAS } from './mocks';
import { FEATURES } from '@shared/config/features';

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
    if (FEATURES.apiOnly) return MOCK_PLANTILLAS;
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
    if (FEATURES.apiOnly) return;
    localStorage.setItem('sistema-monitoreo:plantillas', JSON.stringify(plantillas));
  }, [plantillas]);

  const addPlantilla = useCallback((plantilla: Plantilla) => {
    setPlantillas((prev) => [...prev, plantilla]);
    // Best-effort: persistir descripcion y anio en backend. El mapping completo
    // de desempenos/niveles requiere sincronizar tipos entre Plantilla (frontend)
    // y IPlantilla (backend, contract); queda como TODO(sprint4) refactor.
    plantillasApi
      .create({
        tipoMonitoreo: 'DOCENTE',
        anioAcademico: plantilla.anioAcademico,
        baremo: 'Vigente',
        descripcion: plantilla.descripcion,
        niveles: [],
        desempenos: [],
      })
      .catch((err: unknown) => console.warn('[plantilla] No se pudo crear en backend:', err));
  }, []);

  const updatePlantilla = useCallback((id: string, data: Partial<Plantilla>) => {
    setPlantillas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    plantillasApi
      .update(id, { descripcion: data.descripcion })
      .catch((err: unknown) => console.warn('[plantilla] No se pudo actualizar en backend:', err));
  }, []);

  const deletePlantilla = useCallback((id: string) => {
    setPlantillas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePlantillaEstado = useCallback((id: string) => {
    setPlantillas((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        let nextEstado: Plantilla['estado'];
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
