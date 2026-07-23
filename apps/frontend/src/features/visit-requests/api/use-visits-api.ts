import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ICrearSolicitudVisitaRequest,
  IResolverSolicitudVisitaRequest,
} from '@sistema-monitoreo/shared-contracts';
import { visitsApi } from '@shared/api/visits.api';

const KEY = ['solicitudes-visita'];

export const useSolicitarVisita = () =>
  useMutation({
    mutationFn: (body: ICrearSolicitudVisitaRequest) => visitsApi.solicitar(body),
  });

export const useSolicitudesVisita = (estado?: string) =>
  useQuery({
    queryKey: [...KEY, estado ?? 'todas'],
    queryFn: () => visitsApi.listar(estado),
    refetchInterval: 60_000,
  });

export const useAtenderSolicitud = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: IResolverSolicitudVisitaRequest }) =>
      visitsApi.atender(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useRechazarSolicitud = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: IResolverSolicitudVisitaRequest }) =>
      visitsApi.rechazar(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
