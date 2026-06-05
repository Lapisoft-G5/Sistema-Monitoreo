import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/authentication/useAuth';
import { Sidebar } from '../widgets/Sidebar';
import { TopBar } from '../widgets/TopBar';

const pathToMenuId = (pathname: string): string => {
  const segments = pathname.replace(/^\//, '').split('/');
  if (segments.length === 1) return segments[0];
  return `${segments[0]}_${segments[1]}`;
};

export const AppShell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isAuthenticated) return null;

  const activePage = pathToMenuId(location.pathname);

  const handleNavigate = (page: string) => {
    const route = page.includes('_') ? `/${page.replace('_', '/')}` : `/${page}`;
    navigate(route);
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:static md:z-auto md:flex md:flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar activePage={activePage} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};