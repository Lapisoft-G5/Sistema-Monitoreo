import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES } from '@shared/config/constants';
import { dashboardApi } from '@shared/api/dashboard.api';

export const useDirectorDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'director'],
    queryFn: () => dashboardApi.director(),
    staleTime: STALE_TIMES.DEFAULT,
  });

export const useUgelDashboard = (anio?: number) =>
  useQuery({
    queryKey: ['dashboard', 'ugel', anio ?? 'actual'],
    queryFn: () => dashboardApi.ugel(anio),
    staleTime: STALE_TIMES.DEFAULT,
  });

export const useInstitucionDetalle = (institucionId: string | null) =>
  useQuery({
    queryKey: ['dashboard', 'institucion', institucionId],
    queryFn: () => dashboardApi.institucionDetalle(institucionId as string),
    enabled: !!institucionId,
    staleTime: STALE_TIMES.DEFAULT,
  });
