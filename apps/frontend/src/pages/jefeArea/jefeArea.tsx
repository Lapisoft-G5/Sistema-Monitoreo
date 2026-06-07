import { Sidebar } from '@/widgets/layouts/sidebar';
import { Topbar } from '@/widgets/layouts/topbar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export const SidebarPreviewPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* 🟥 WIDGET LATERAL (Oculto en móvil a menos que mobileMenuOpen sea true) */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Overlay oscuro para móvil cuando el menú está abierto */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* CONTENEDOR DERECHO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 🟪🟦 WIDGET SUPERIOR */}
        <Topbar onOpenMobileSidebar={() => setMobileMenuOpen(true)} />

        {/* 🟨 ZONA AMARILLA: Contenido Dinámico */}
        <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};