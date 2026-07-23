import type {
  IDirectorDashboardResponse,
  IUgelDashboardInstitucionDetalle,
  IUgelDashboardResponse,
} from '@sistema-monitoreo/shared-contracts';
import type { SessionUser } from '../../../shared/types/session-user.js';

export type SessionScope = SessionUser;

export abstract class DashboardRepository {
  abstract getDirectorDashboard(session: SessionScope): Promise<IDirectorDashboardResponse>;
  abstract getUgelDashboard(session: SessionScope, anio: number): Promise<IUgelDashboardResponse>;
  abstract getInstitucionDetalle(
    session: SessionScope,
    institucionId: string,
    anio: number,
  ): Promise<IUgelDashboardInstitucionDetalle>;
}
