import { useState } from 'react';
import { useAuth } from '../features/authentication/useAuth';
import { ROLE_PERMISSIONS } from '../shared/constants/roles';
import type { MenuItem } from '../shared/constants/roles';
import { Sidebar } from '../widgets/Sidebar';
import { TopBar } from '../widgets/TopBar';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PlaceholderPage } from '../shared/ui/PlaceholderPage';
import { EspecialistasPage } from '../pages/administration/EspecialistasPage';
import { EspecialistaCreatePage } from '../pages/administration/EspecialistaCreatePage';
import { EspecialistaEditPage } from '../pages/administration/EspecialistaEditPage';
import { EspecialistaDetailPage } from '../pages/administration/EspecialistaDetailPage';
import { InstitutionsPage } from '../pages/institutions/InstitutionsPage';

// Vista activa: página simple o página con parámetro (Origen: feature branch)
type ActiveView =
  | { page: string }
  | { page: 'especialistas_create' }
  | { page: 'especialistas_detail'; id: string }
  | { page: 'especialistas_edit'; id: string };

const PAGE_MAP: Record<string, React.ReactNode> = {
  dashboard: <DashboardPage />,
  monitoreo_plan: (
    <PlaceholderPage
      title="Plan de Monitoreo"
      description="Gestione el cronograma anual de visitas de monitoreo a las instituciones educativas."
    />
  ),
  monitoreo_gestion: (
    <PlaceholderPage
      title="Gestión de Monitoreo"
      description="Registre y realice seguimiento a las visitas de monitoreo pedagógico realizadas."
    />
  ),
  instituciones_padron: <InstitutionsPage />,
  instituciones_docentes: (
    <PlaceholderPage
      title="Padrón de Docentes"
      description="Gestione el registro de docentes por institución educativa."
    />
  ),
  especialistas: (
    <PlaceholderPage
      title="Especialistas"
      description="Administre el equipo de especialistas de monitoreo de la UGEL."
    />
  ),
  reportes: (
    <PlaceholderPage
      title="Reportes"
      description="Genere y descargue reportes estadísticos sobre el desempeño educativo."
    />
  ),
  configuracion: (
    <PlaceholderPage
      title="Configuración"
      description="Gestione parámetros del sistema, usuarios y configuraciones generales."
    />
  ),
};

const ForbiddenPage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
    color: '#0f172a',
    textAlign: 'center',
    padding: '20px'
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#fef2f2',
      border: '1px solid #fee2e2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1)'
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    </div>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1e293b' }}>
      403 - Acceso No Autorizado
    </h2>
    <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '380px', margin: '0 0 20px 0', lineHeight: '1.6' }}>
      Lo sentimos, su rol de usuario no cuenta con los privilegios necesarios para visualizar esta sección del sistema de monitoreo.
    </p>
  </div>
);

PAGE_MAP['forbidden'] = <ForbiddenPage />;

export const AppShell = () => {
  const { user } = useAuth();

  // 1. Obtención segura de permisos (Origen: develop)
  const permissions = user && ROLE_PERMISSIONS[user.role] ? ROLE_PERMISSIONS[user.role] : [];
  const defaultPage = permissions.length > 0 ? permissions[0] : 'dashboard';

  // 2. Inicialización del estado de tipo ActiveView (Origen: feature branch)
  const [view, setView] = useState<ActiveView>({ page: defaultPage });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 3. Sistema de navegación con control de accesos (Origen: develop)
  const navigate = (page: string) => {
    if (permissions.includes(page as MenuItem)) {
      setView({ page });
    } else {
      setView({ page: 'forbidden' });
    }
  };

  // 4. Cálculo de la sección activa para preservar el foco visual del menú lateral
  const activePage =
    ['especialistas_create', 'especialistas_edit', 'especialistas_detail'].includes(view.page)
      ? 'especialistas'
      : view.page;

  // 5. Verificación de permisos extendida (Origen: develop + feature branch)
  const hasAccess = permissions.includes(activePage as MenuItem) || view.page === 'forbidden';

  // 6. Renderizador unificado de contenidos
  const renderContent = () => {
    if (!hasAccess) return <ForbiddenPage />;

    switch (view.page) {
      // ── Módulo Especialistas CRUD (Origen: feature branch) ─────────────────
      case 'especialistas':
        return (
          <EspecialistasPage
            onNavigateCreate={() => setView({ page: 'especialistas_create' })}
            onNavigateEdit={(id) => setView({ page: 'especialistas_edit', id })}
            onNavigateDetail={(id) => setView({ page: 'especialistas_detail', id })}
          />
        );

      case 'especialistas_create':
        return (
          <EspecialistaCreatePage
            onBack={() => setView({ page: 'especialistas' })}
            onSuccess={() => setView({ page: 'especialistas' })}
          />
        );

      case 'especialistas_detail':
        return (
          <EspecialistaDetailPage
            especialistaId={(view as { page: 'especialistas_detail'; id: string }).id}
            onBack={() => setView({ page: 'especialistas' })}
            onNavigateEdit={(id) => setView({ page: 'especialistas_edit', id })}
          />
        );

      case 'especialistas_edit':
        return (
          <EspecialistaEditPage
            especialistaId={(view as { page: 'especialistas_edit'; id: string }).id}
            onBack={() => setView({ page: 'especialistas' })}
            onSuccess={() => setView({ page: 'especialistas' })}
          />
        );

      // ── Páginas Generales / Fallback dinámico (Origen: develop) ────────────
      default:
        return PAGE_MAP[view.page] ?? PAGE_MAP[defaultPage];
    }
  };

  // Estructura visual y Layout utilizando los estilos en línea actualizados de develop
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar activePage={activePage} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};