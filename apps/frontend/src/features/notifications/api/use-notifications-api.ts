import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ICrearAlertaDistritoRequest,
  ICrearAlertaInstitucionRequest,
} from '@sistema-monitoreo/shared-contracts';
import { notificationsApi } from '@shared/api/notifications.api';

const KEY = ['notificaciones'];

export const useNotificaciones = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => notificationsApi.list(),
    refetchInterval: 15_000,
  });

export const useMarcarLeida = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.marcarLeida(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useMarcarTodasLeidas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.marcarTodas(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useEnviarAlerta = () =>
  useMutation({
    mutationFn: (body: ICrearAlertaInstitucionRequest) => notificationsApi.alertaInstitucion(body),
  });

export const useEnviarAlertaDistrito = () =>
  useMutation({
    mutationFn: (body: ICrearAlertaDistritoRequest) => notificationsApi.alertaDistrito(body),
  });
