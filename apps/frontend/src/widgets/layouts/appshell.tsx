import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '@entities/model-user';
import { Sidebar } from '@widgets/layouts/sidebar';
import { Topbar } from '@widgets/layouts/topbar';

export const AppShell = () => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  
  // El AppShell solo gestiona el estado visual del menú adaptativo (móvil)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guarda de seguridad global: Rebota al login si no hay sesión activa
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Evita parpadeos visuales de interfaz mientras se procesa la redirección
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      
      {/* 🟥 WIDGET LATERAL (Sidebar)
          Se posiciona de forma flotante en móviles mediante transformaciones 
          y se integra al flujo Flexbox de forma natural en pantallas de escritorio */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* Capa de fondo oscura (Overlay) al abrir el menú en dispositivos móviles */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* CONTENEDOR MAESTRO DERECHO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 🟪🟦 WIDGET SUPERIOR (Topbar)
            Le pasamos únicamente la acción para abrir el menú lateral en móviles */}
        <Topbar onOpenMobileSidebar={() => setMobileMenuOpen(true)} />

        {/* 🟨 ZONA DE CONTENIDO DINÁMICO (Lienzo Principal)
            Maneja el scroll independiente de las páginas internas */}
        <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8">
          {/* El Outlet actúa como el punto de anclaje donde React Router 
              inyectará componentes como InstitucionesPage, DocentesPage, etc., 
              según la URL del navegador */}
          <Outlet />
        </main>

      </div>
    </div>
  );
};