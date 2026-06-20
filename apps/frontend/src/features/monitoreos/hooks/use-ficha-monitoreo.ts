import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasApi, type CreateFichaInput } from '../api/fichas.api.js';
import type { IFichaMonitoreo } from '@sistema-monitoreo/shared-contracts';

export const useFichaByVisita = (cronogramaId: string | undefined) =>
  useQuery({
    queryKey: ['ficha', 'visita', cronogramaId],
    queryFn: () => fichasApi.findByVisita(cronogramaId!),
    enabled: !!cronogramaId,
  });

export const useFicha = (id: string | undefined) =>
  useQuery({
    queryKey: ['ficha', id],
    queryFn: () => fichasApi.findById(id!),
    enabled: !!id,
  });

export const useCrearFicha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFichaInput) => fichasApi.create(data),
    onSuccess: (ficha: IFichaMonitoreo) => {
      qc.setQueryData(['ficha', 'visita', ficha.cronogramaId], ficha);
      qc.setQueryData(['ficha', ficha.id], ficha);
    },
  });
};

export const useGuardarRespuesta = (fichaId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ desempenoId, nivel }: { desempenoId: string; nivel: number }) =>
      fichasApi.saveRespuestaDesempeno(fichaId, desempenoId, nivel),
    onSuccess: (ficha: IFichaMonitoreo) => {
      qc.setQueryData(['ficha', ficha.id], ficha);
      qc.setQueryData(['ficha', 'visita', ficha.cronogramaId], ficha);
    },
  });
};

export const useGuardarRespuestaAspecto = (fichaId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aspectoId, marcado }: { aspectoId: string; marcado: boolean }) =>
      fichasApi.saveRespuestaAspecto(fichaId, aspectoId, marcado),
    onSuccess: (ficha: IFichaMonitoreo) => {
      qc.setQueryData(['ficha', ficha.id], ficha);
      qc.setQueryData(['ficha', 'visita', ficha.cronogramaId], ficha);
    },
  });
};

export const useFinalizarFicha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observaciones }: { id: string; observaciones?: string }) =>
      fichasApi.finalizar(id, observaciones),
    onSuccess: (ficha: IFichaMonitoreo) => {
      qc.setQueryData(['ficha', ficha.id], ficha);
      qc.setQueryData(['ficha', 'visita', ficha.cronogramaId], ficha);
    },
  });
};

export const useMigrarPlantilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plantillaId }: { id: string; plantillaId: string }) =>
      fichasApi.migrarPlantilla(id, plantillaId),
    onSuccess: (ficha: IFichaMonitoreo) => {
      qc.setQueryData(['ficha', ficha.id], ficha);
      qc.setQueryData(['ficha', 'visita', ficha.cronogramaId], ficha);
      // Limpia cache de plantillas (la v1 ahora es Historico)
      qc.invalidateQueries({ queryKey: ['plantillas'] });
      qc.invalidateQueries({ queryKey: ['plantilla'] });
    },
  });
};
