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

  // 1. Obtenemos la lista de permisos del rol actual
  const permissions = user && ROLE_PERMISSIONS[user.role] ? ROLE_PERMISSIONS[user.role] : [];

  const defaultPage = permissions.length > 0 ? permissions[0] : 'dashboard';

  // 3. Inicializamos el estado dinámicamente con su página por defecto
  const [activePage, setActivePage] = useState<string>(defaultPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (page: string) => {
    if (permissions.includes(page as MenuItem)) {
      setActivePage(page);
    } else {
      setActivePage('forbidden');
    }
  };

  const hasAccess = permissions.includes(activePage as MenuItem) || activePage === 'forbidden';

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
          {hasAccess ? (PAGE_MAP[activePage] ?? PAGE_MAP[defaultPage]) : <ForbiddenPage />}
        </main>
      </div>
    </div>
  );
};
