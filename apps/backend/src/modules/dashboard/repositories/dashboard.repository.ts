import type { IDirectorDashboardResponse } from '@sistema-monitoreo/shared-contracts';
import type { SessionUser } from '../../../shared/types/session-user.js';

export type SessionScope = SessionUser;

export abstract class DashboardRepository {
  abstract getDirectorDashboard(session: SessionScope): Promise<IDirectorDashboardResponse>;
}
