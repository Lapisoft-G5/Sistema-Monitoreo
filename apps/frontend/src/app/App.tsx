import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../features/authentication/useAuth';
import { AuthProvider } from '../features/authentication/AuthProvider';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AppShell } from './AppShell';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { PageSkeleton } from '../shared/ui/PageSkeleton';
import { lazy, Suspense, useState } from 'react';

// ── Lazy imports de páginas ───────────────────────────────────────────────────
const DashboardPage = lazy(() =>
  import('../pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const EspecialistasPage = lazy(() =>
  import('../pages/administration/EspecialistasPage').then((m) => ({
    default: m.EspecialistasPage,
  })),
);
const EspecialistaCreatePage = lazy(() =>
  import('../pages/administration/EspecialistaCreatePage').then((m) => ({
    default: m.EspecialistaCreatePage,
  })),
);
const EspecialistaEditPage = lazy(() =>
  import('../pages/administration/EspecialistaEditPage').then((m) => ({
    default: m.EspecialistaEditPage,
  })),
);
const EspecialistaDetailPage = lazy(() =>
  import('../pages/administration/EspecialistaDetailPage').then((m) => ({
    default: m.EspecialistaDetailPage,
  })),
);
const DocentesPage = lazy(() =>
  import('../pages/administration/DocentesPage').then((m) => ({ default: m.DocentesPage })),
);
const DocenteCreatePage = lazy(() =>
  import('../pages/administration/DocenteCreatePage').then((m) => ({
    default: m.DocenteCreatePage,
  })),
);
const DocenteEditPage = lazy(() =>
  import('../pages/administration/DocenteEditPage').then((m) => ({ default: m.DocenteEditPage })),
);
const DocenteDetailPage = lazy(() =>
  import('../pages/administration/DocenteDetailPage').then((m) => ({
    default: m.DocenteDetailPage,
  })),
);
const PlaceholderPage = lazy(() =>
  import('../shared/ui/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
);

// ── AuthRouter — DEBE ir ANTES de createBrowserRouter ────────────────────────
type AuthView = 'login' | 'forgot-password';

const AuthRouter = () => {
  const { isAuthenticated, requiresPasswordChange } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  if (isAuthenticated && !requiresPasswordChange) return <Navigate to="/dashboard" replace />;
  if (isAuthenticated && requiresPasswordChange) return <ChangePasswordPage onSuccess={() => {}} />;
  if (view === 'forgot-password') return <ForgotPasswordPage onBack={() => setView('login')} />;

  return (
    <LoginPage
      onLoginSuccess={() => {}}
      onForgotPassword={() => setView('forgot-password')}
      onChangePassword={() => {}}
    />
  );
};

// ── Router con todas las rutas ────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredPermission="dashboard">
            <Lazy>
              <DashboardPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },

      // Especialistas
      {
        path: 'especialistas',
        element: (
          <ProtectedRoute requiredPermission="especialistas">
            <Lazy>
              <EspecialistasPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'especialistas/nuevo',
        element: (
          <ProtectedRoute requiredPermission="especialistas" requiresWrite>
            <Lazy>
              <EspecialistaCreatePage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'especialistas/:id',
        element: (
          <ProtectedRoute requiredPermission="especialistas">
            <Lazy>
              <EspecialistaDetailPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'especialistas/:id/editar',
        element: (
          <ProtectedRoute requiredPermission="especialistas" requiresWrite>
            <Lazy>
              <EspecialistaEditPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },

      // Monitoreo
      {
        path: 'monitoreo/plan',
        element: (
          <ProtectedRoute requiredPermission="monitoreo_plan">
            <Lazy>
              <PlaceholderPage
                title="Plan de Monitoreo"
                description="Gestione el cronograma anual de visitas de monitoreo a las instituciones educativas."
              />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'monitoreo/gestion',
        element: (
          <ProtectedRoute requiredPermission="monitoreo_gestion">
            <Lazy>
              <PlaceholderPage
                title="Gestión de Monitoreo"
                description="Registre y realice seguimiento a las visitas de monitoreo pedagógico realizadas."
              />
            </Lazy>
          </ProtectedRoute>
        ),
      },

      // Instituciones
      {
        path: 'instituciones/padron',
        element: (
          <ProtectedRoute requiredPermission="instituciones_padron">
            <Lazy>
              <PlaceholderPage
                title="Padrón de Instituciones"
                description="Administre el padrón completo de instituciones educativas de la UGEL Lampa."
              />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'instituciones/docentes',
        element: (
          <ProtectedRoute requiredPermission="instituciones_docentes">
            <Lazy>
              <DocentesPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'instituciones/docentes/nuevo',
        element: (
          <ProtectedRoute requiredPermission="instituciones_docentes" requiresWrite>
            <Lazy>
              <DocenteCreatePage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'instituciones/docentes/:id',
        element: (
          <ProtectedRoute requiredPermission="instituciones_docentes">
            <Lazy>
              <DocenteDetailPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'instituciones/docentes/:id/editar',
        element: (
          <ProtectedRoute requiredPermission="instituciones_docentes" requiresWrite>
            <Lazy>
              <DocenteEditPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },

      // Reportes y Configuración
      {
        path: 'reportes',
        element: (
          <ProtectedRoute requiredPermission="reportes">
            <Lazy>
              <PlaceholderPage
                title="Reportes"
                description="Genere y descargue reportes estadísticos sobre el desempeño educativo."
              />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <ProtectedRoute requiredPermission="configuracion">
            <Lazy>
              <PlaceholderPage
                title="Configuración"
                description="Gestione parámetros del sistema, usuarios y configuraciones generales."
              />
            </Lazy>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Rutas de auth (fuera del AppShell, sin sidebar)
  { path: '/login', element: <AuthRouter /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

// ── Componente raíz ───────────────────────────────────────────────────────────
export const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
