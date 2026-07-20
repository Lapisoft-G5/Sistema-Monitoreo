import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES } from '@shared/config/constants';
import { dashboardApi } from '@shared/api/dashboard.api';

export const useDirectorDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'director'],
    queryFn: () => dashboardApi.director(),
    staleTime: STALE_TIMES.DEFAULT,
  });
