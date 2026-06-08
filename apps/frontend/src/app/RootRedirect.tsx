import { Navigate } from 'react-router-dom';
import { useUser } from '@entities/model-user';
import { getDefaultLandingPage } from '@shared/constants/roles';

export const RootRedirect = () => {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultLandingPage(user.role)} replace />;
};
