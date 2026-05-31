import { useState } from 'react';
import { useAuth } from '../features/authentication/useAuth';
import { ROLE_PERMISSIONS } from '../shared/constants/roles';
import type { MenuItem } from '../shared/constants/roles';
import { Sidebar } from '../widgets/Sidebar';
import { TopBar } from '../widgets/TopBar';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PlaceholderPage } from '../shared/ui/PlaceholderPage';

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
  instituciones_padron: (
    <PlaceholderPage
      title="Padrón de Instituciones"
      description="Administre el padrón completo de instituciones educativas de la UGEL Lampa."
    />
  ),
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

export const AppShell = () => {
  const { user } = useAuth();

  // 1. Obtenemos la lista de permisos del rol actual
  const permissions = user && ROLE_PERMISSIONS[user.role] ? ROLE_PERMISSIONS[user.role] : [];

  const defaultPage = permissions.length > 0 ? permissions[0] : 'dashboard';

  // 3. Inicializamos el estado dinámicamente con su página por defecto
  const [activePage, setActivePage] = useState<string>(defaultPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (page: string) => {
    if (permissions.includes(page as MenuItem)) setActivePage(page);
  };

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
          {PAGE_MAP[activePage] ?? PAGE_MAP[defaultPage]}
        </main>
      </div>
    </div>
  );
};
