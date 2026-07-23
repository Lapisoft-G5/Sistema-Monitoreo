import { useUser } from '@entities/model-user';
import { DashboardPage } from './directorUgel/DashboardPage';
import { DashboardDirectorPage } from './director/DashboardDirectorPage';

/**
 * Punto de entrada de `/dashboard`. Selecciona el dashboard según el rol:
 *   - director_institucion → dashboard de su IE (KPIs, semáforo, recientes).
 *   - resto (director_ugel, admin, invitado) → dashboard provincial UGEL.
 */
export const DashboardEntry = () => {
  const { user } = useUser();

  if (user?.role === 'director_institucion') {
    return <DashboardDirectorPage />;
  }

  return <DashboardPage />;
};
