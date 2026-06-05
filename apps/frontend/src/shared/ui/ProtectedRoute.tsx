import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/authentication/useAuth';
import { hasPermission, isReadOnlyRole } from '../constants/roles';
import type { MenuItem } from '../constants/roles';

interface Props {
  /** Permiso de menú requerido para acceder a esta ruta */
  requiredPermission: MenuItem;
  /**
   * Si es true, los roles de solo lectura (invitado) serán redirigidos
   * de vuelta a la vista de listado de esa sección.
   * Úsalo en rutas de creación/edición.
   */
  requiresWrite?: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute = ({ requiredPermission, requiresWrite = false, children }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Sin sesión → login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sin permiso para esta sección → dashboard
  if (!hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Rol read-only intentando acceder a ruta de escritura → listado de la sección
  if (requiresWrite && isReadOnlyRole(user.role)) {
    const basePath = `/${requiredPermission.replace('_', '/')}`;
    return <Navigate to={basePath} replace />;
  }

  return <>{children}</>;
};
