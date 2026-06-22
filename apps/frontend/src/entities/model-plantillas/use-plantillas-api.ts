import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantillasApi, type CreatePlantillaInput, type UpdatePlantillaInput } from './api/plantillas.api.js';
import type { IPlantilla, EstadoPlantilla } from '@sistema-monitoreo/shared-contracts';

/**
 * Hooks granulares para acceder al backend de plantillas via TanStack Query.
 * TODO(sprint4): migrar las paginas (PlantillasCatalog, PlantillaCreate,
 * PlantillaEdit) de useContext local a usePlantillasList + useCrearPlantilla
 * + useActualizarPlantilla. Requiere mapear IPlantilla (backend) a
 * Plantilla (frontend local model) - especialmente la estructura de
 * niveles/desempenos que difieren.
 */

export const usePlantillasList = (filters?: { anioAcademico?: number; estado?: EstadoPlantilla }) =>
  useQuery({
    queryKey: ['plantillas', filters],
    queryFn: () => plantillasApi.findAll(filters),
    staleTime: 5_000,
    refetchOnMount: true,
  });

export const usePlantilla = (id: string | undefined) =>
  useQuery({
    queryKey: ['plantilla', id],
    queryFn: () => plantillasApi.findById(id!),
    enabled: !!id,
  });

export const useCrearPlantilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantillaInput) => plantillasApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plantillas'] });
    },
  });
};

export const useActualizarPlantilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlantillaInput }) =>
      plantillasApi.update(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['plantillas'] });
      qc.setQueryData(['plantilla', result.id], result.plantilla);
    },
  });
};

export const useCambiarEstadoPlantilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPlantilla }) =>
      plantillasApi.cambiarEstado(id, estado),
    onSuccess: (planilla: IPlantilla) => {
      qc.invalidateQueries({ queryKey: ['plantillas'] });
      qc.setQueryData(['plantilla', planilla.id], planilla);
    },
  });
};

export const useDuplicarPlantilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, descripcion }: { id: string; descripcion?: string }) =>
      plantillasApi.duplicar(id, descripcion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plantillas'] });
    },
  });
};
