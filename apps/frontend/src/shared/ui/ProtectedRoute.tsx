import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@entities/model-user';
import { hasPermission, getDefaultLandingPage, type MenuItem } from '@shared/constants/roles';

interface ProtectedRouteProps {
  permission: MenuItem;
}

export const ProtectedRoute = ({ permission }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !hasPermission(user.role, permission)) {
    const landing = getDefaultLandingPage(user.role);
    return <Navigate to={landing} replace />;
  }

  return <Outlet />;
};
