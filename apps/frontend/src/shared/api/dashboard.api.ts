import type { IDirectorDashboardResponse } from '@sistema-monitoreo/shared-contracts';
import { request } from '../config/api.js';

export const dashboardApi = {
  director: () => request<IDirectorDashboardResponse>('/api/dashboard/director'),
};
