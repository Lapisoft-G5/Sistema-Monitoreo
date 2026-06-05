import { useState, lazy, Suspense } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../features/authentication/useAuth';
import { AuthProvider } from '../features/authentication/AuthProvider';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AppShell } from './AppShell';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { PageSkeleton } from '../shared/ui/PageSkeleton';

// ── Lazy imports de páginas (feature/teachers-management) ─────────────────────
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

// ── AuthRouter Unificado (Conserva la lógica de tokens de develop) ──────────────
interface AuthRouterProps {
  mode: 'router' | 'conditional';
}

const AuthRouter = ({ mode }: AuthRouterProps) => {
  const { isAuthenticated, requiresPasswordChange } = useAuth();
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  
  // Captura de token para ResetPasswordPage (develop)
  const [token, setToken] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get('token');
  });

  if (token) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          // Limpiar el parámetro token de la URL tras el cambio exitoso
          window.history.replaceState({}, document.title, window.location.pathname);
          setToken(null);
          setView('login');
        }}
      />
    );
  }

  if (isAuthenticated && requiresPasswordChange) {
    return <ChangePasswordPage onSuccess={() => {}} />;
  }

  if (isAuthenticated) {
    // Si estamos usando la arquitectura de develop, renderiza el Shell directamente
    // Si usamos react-router-dom, redirige programáticamente a la ruta del dashboard
    return mode === 'conditional' ? <AppShell /> : <Navigate to="/dashboard" replace />;
  }

  if (view === 'forgot-password') {
    return <ForgotPasswordPage onBack={() => setView('login')} />;
  }

  return (
    <LoginPage
      onLoginSuccess={() => {}}
      onForgotPassword={() => setView('forgot-password')}
      onChangePassword={() => {}}
    />
  );
};

// ── Router con todas las rutas estructuradas (feature/teachers-management) ─────
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

  // Rutas de auth independientes
  { path: '/login', element: <AuthRouter mode="router" /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

// ── Componente Raíz de la Aplicación con Selector de Estrategia ────────────────
export const App = () => {
  // Permite al equipo decidir qué motor de renderizado y flujo de vistas usar durante el merge
  const [routingMode, setRoutingMode] = useState<'router' | 'conditional'>('router');

  return (
    <AuthProvider>
      {/* Panel de control de arquitectura exclusivo para el entorno de desarrollo */}
      <div style={{ position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 6, zIndex: 99999, background: '#0f172a', padding: 6, borderRadius: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
        <button
          onClick={() => setRoutingMode('router')}
          style={{ padding: '4px 10px', fontSize: '11px', background: routingMode === 'router' ? '#22c55e' : '#334155', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
        >
          React Router Architecture (teachers-management)
        </button>
        <button
          onClick={() => setRoutingMode('conditional')}
          style={{ padding: '4px 10px', fontSize: '11px', background: routingMode === 'conditional' ? '#0f52ba' : '#334155', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
        >
          Conditional Base Layout (develop)
        </button>
      </div>

      {routingMode === 'router' ? (
        <RouterProvider router={router} />
      ) : (
        <AuthRouter mode="conditional" />
      )}
    </AuthProvider>
  );
};