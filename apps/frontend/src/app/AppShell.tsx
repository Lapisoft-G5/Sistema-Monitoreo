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

// Vista activa: página simple o página con parámetro
type ActiveView =
  | { page: string }
  | { page: 'especialistas_create' }
  | { page: 'especialistas_detail'; id: string }
  | { page: 'especialistas_edit'; id: string };

export const AppShell = () => {
  const { user } = useAuth();

  const permissions = user ? ROLE_PERMISSIONS[user.role] : [];
  const defaultPage = permissions.length > 0 ? permissions[0] : 'dashboard';

  const [view, setView] = useState<ActiveView>({ page: defaultPage });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (page: string) => {
    if (permissions.includes(page as MenuItem)) setView({ page });
  };

  // activePage que el Sidebar y TopBar necesitan para resaltar el ítem correcto
  const activePage =
    view.page === 'especialistas_create' || view.page === 'especialistas_edit'
      ? 'especialistas'
      : view.page;

  const renderContent = () => {
    switch (view.page) {
      // ── Especialistas ─────────────────────────────────────────────────────
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

      // ── Dashboard ─────────────────────────────────────────────────────────
      case 'dashboard':
        return <DashboardPage />;

      // ── Placeholders ──────────────────────────────────────────────────────
      case 'monitoreo_plan':
        return (
          <PlaceholderPage
            title="Plan de Monitoreo"
            description="Gestione el cronograma anual de visitas de monitoreo a las instituciones educativas."
          />
        );
      case 'monitoreo_gestion':
        return (
          <PlaceholderPage
            title="Gestión de Monitoreo"
            description="Registre y realice seguimiento a las visitas de monitoreo pedagógico realizadas."
          />
        );
      case 'instituciones_padron':
        return (
          <PlaceholderPage
            title="Padrón de Instituciones"
            description="Administre el padrón completo de instituciones educativas de la UGEL Lampa."
          />
        );
      case 'instituciones_docentes':
        return (
          <PlaceholderPage
            title="Padrón de Docentes"
            description="Gestione el registro de docentes por institución educativa."
          />
        );
      case 'reportes':
        return (
          <PlaceholderPage
            title="Reportes"
            description="Genere y descargue reportes estadísticos sobre el desempeño educativo."
          />
        );
      case 'configuracion':
        return (
          <PlaceholderPage
            title="Configuración"
            description="Gestione parámetros del sistema, usuarios y configuraciones generales."
          />
        );

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activePage={activePage} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
