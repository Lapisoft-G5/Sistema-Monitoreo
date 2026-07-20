import type {
  IDirectorDashboardResponse,
  IUgelDashboardResponse,
} from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

export const dashboardApi = {
  director: () => request<IDirectorDashboardResponse>('/api/dashboard/director'),
  ugel: (anio?: number) =>
    request<IUgelDashboardResponse>(`/api/dashboard/ugel${anio ? `?anio=${anio}` : ''}`),
};
