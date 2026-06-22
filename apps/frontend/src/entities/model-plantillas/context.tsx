/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { plantillasApi } from './api/plantillas.api.js';
import type { Plantilla } from './model';
import { FEATURES } from '@shared/config/features';
import type { UpdatePlantillaInput } from './api/plantillas.api.js';

export interface PlantillasContextType {
  plantillas: Plantilla[];
  setPlantillas: React.Dispatch<React.SetStateAction<Plantilla[]>>;
  addPlantilla: (plantilla: Plantilla) => void;
  updatePlantilla: (id: string, data: Partial<Plantilla>) => void;
  deletePlantilla: (id: string) => void;
  togglePlantillaEstado: (id: string) => void;
}

const mapPlantillaToUpdateInput = (data: Partial<Plantilla>): UpdatePlantillaInput => {
  const out: UpdatePlantillaInput = {};
  if (data.baremo !== undefined) out.baremo = data.baremo;
  if (data.descripcion !== undefined) out.descripcion = data.descripcion;
  if (data.niveles) {
    out.niveles = data.niveles.map((n, i) => ({
      nivelRomano: n.nivel,
      denominacion: n.denominacion,
      rangoMin: n.rangoMin,
      color: n.color,
      orden: i + 1,
    }));
  }
  if (data.desempenos) {
    out.desempenos = data.desempenos.map((d, i) => ({
      id: d.id,
      nombre: d.nombre,
      descripcionCorta: d.descripcionCorta,
      preguntaExtra: d.preguntaExtra || undefined,
      orden: i + 1,
      aspectos: d.aspectos.map((a, ai) => ({
        id: a.id,
        descripcion: a.descripcion,
        orden: ai + 1,
      })),
      rubrica: (d.rubrica ?? []).map((r) => ({
        nivelRomano: r.nivel,
        descripcion: r.descripcion,
      })),
    }));
  }
  if (data.ejesItems) {
    out.ejeItems = data.ejesItems.map((item) => ({
      numero: item.numero,
      descripcion: item.descripcion,
    }));
  }
  return out;
};

export const PlantillasContext = createContext<PlantillasContextType | undefined>(undefined);

export const PlantillasProvider = ({ children }: { children: ReactNode }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>(() => {
    if (FEATURES.apiOnly) return [];
    const saved = localStorage.getItem('sistema-monitoreo:plantillas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (FEATURES.apiOnly) return;
    localStorage.setItem('sistema-monitoreo:plantillas', JSON.stringify(plantillas));
  }, [plantillas]);

  const addPlantilla = useCallback((plantilla: Plantilla) => {
    // Solo agregar al estado local. La creación en el backend
    // la maneja PlantillaCreatePage directamente via plantillasApi.
    setPlantillas((prev) => [...prev, plantilla]);
  }, []);

  const updatePlantilla = useCallback((id: string, data: Partial<Plantilla>) => {
    setPlantillas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    plantillasApi
      .update(id, mapPlantillaToUpdateInput(data))
      .then((result) => {
        // Sincronizar el ID si el backend creó una nueva versión
        if (result.modo === 'VERSIONADO' && result.id !== id) {
          setPlantillas((prev) =>
            prev.map((p) => (p.id === id ? { ...p, id: result.id, version: result.version } : p))
          );
        }
      })
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
        const isArchiving = p.estado === 'Historico';
        if (isArchiving) nextEstado = 'Borrador';
        else if (p.estado === 'Borrador') nextEstado = 'Vigente';
        else nextEstado = 'Historico';

        // Persistir cambio de estado en backend
        plantillasApi
          .cambiarEstado(id, nextEstado)
          .catch((err: unknown) => console.warn('[plantilla] No se pudo cambiar estado en backend:', err));

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
