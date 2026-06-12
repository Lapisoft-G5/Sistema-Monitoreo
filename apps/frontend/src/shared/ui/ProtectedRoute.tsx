import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@entities/model-user';
import {
  hasPermission,
  getDefaultLandingPage,
  ROLE_PERMISSIONS,
  type MenuItem,
} from '@shared/constants/roles';

interface ProtectedRouteProps {
  permission: MenuItem;
}

export const ProtectedRoute = ({ permission }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useUser();

  // Sin sesión o con un rol inválido → al login (evita crashes y bucles de redirección)
  if (!isAuthenticated || !user || !ROLE_PERMISSIONS[user.role]) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(user.role, permission)) {
    const landing = getDefaultLandingPage(user.role);
    return <Navigate to={landing} replace />;
  }

  return <Outlet />;
};
