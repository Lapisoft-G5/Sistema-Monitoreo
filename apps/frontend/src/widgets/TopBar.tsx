import { useState } from 'react';
import { useAuth } from '../features/authentication/useAuth';
import { ROLE_LABELS } from '../shared/constants/roles';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Panel de Control',
  monitoreo_plan: 'Plan de Monitoreo',
  monitoreo_gestion: 'Gestión de Monitoreo',
  instituciones_padron: 'Padrón de Instituciones',
  instituciones_docentes: 'Padrón de Docentes',
  especialistas: 'Especialistas',
  reportes: 'Reportes',
  configuracion: 'Configuración',
};

interface Props {
  activePage: string;
  /** Callback para abrir el sidebar en móvil (hamburger) */
  onOpenMobileSidebar: () => void;
}

export const TopBar = ({ activePage, onOpenMobileSidebar }: Props) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const title = PAGE_TITLES[activePage] ?? 'UGEL Lampa';

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-surface/95 border-b border-border backdrop-blur-xl sticky top-0 z-20">
      {/* ── Izquierda: hamburger (móvil) + breadcrumb ── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — solo visible en móvil */}
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer bg-transparent border-none md:hidden"
          aria-label="Abrir menú"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.83rem]">
          <span className="text-text-muted hidden sm:inline">UGEL Lampa</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-dim hidden sm:block"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-text font-semibold">{title}</span>
        </div>
      </div>

      {/* ── Derecha: acciones + usuario ── */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notificaciones */}
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer bg-transparent border-none">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-surface" />
        </button>

        {/* Ayuda — oculto en móvil pequeño */}
        <button className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer bg-transparent border-none hidden sm:block">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Usuario */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-[7px] bg-bg border border-border rounded-[10px] cursor-pointer hover:bg-border transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full flex-shrink-0 bg-primary flex items-center justify-center text-white text-[0.68rem] font-bold">
              {user?.nombres[0]}
              {user?.apellidos[0]}
            </div>

            {/* Nombre + rol — solo visible en sm+ */}
            <div className="flex-col text-left hidden sm:flex">
              <span className="text-text text-[0.78rem] font-semibold whitespace-nowrap">
                {user?.nombres} {user?.apellidos}
              </span>
              <span className="text-text-muted text-[0.65rem] whitespace-nowrap">
                {user ? ROLE_LABELS[user.role] : ''}
              </span>
            </div>

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-muted hidden sm:block"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <div
              onMouseLeave={() => setOpen(false)}
              className="absolute right-0 mt-1.5 w-40 bg-surface border border-border rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1 flex flex-col z-50"
            >
              <button
                onClick={logout}
                className="px-3 py-2 bg-transparent border-none text-danger text-left text-[0.83rem] cursor-pointer rounded-md hover:bg-danger/10 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
