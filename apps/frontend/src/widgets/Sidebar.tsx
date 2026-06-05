import { useState } from 'react';
import { useAuth } from '../features/authentication/useAuth';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../shared/constants/roles';
import type { MenuItem } from '../shared/constants/roles';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    children: [],
  },
  {
    id: 'monitoreo',
    label: 'Monitoreo',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    children: [
      { id: 'monitoreo_plan', label: 'Plan de Monitoreo' },
      { id: 'monitoreo_gestion', label: 'Gestión de Monitoreo' },
    ],
  },
  {
    id: 'instituciones_padron',
    label: 'Instituciones',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    children: [],
  },
  {
    id: 'instituciones_docentes',
    label: 'Docentes',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    children: [],
  },
  {
    id: 'especialistas',
    label: 'Especialistas',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    children: [],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    children: [],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    children: [],
  },
];

export const Sidebar = ({ activePage, onNavigate, collapsed, onToggleCollapse }: Props) => {
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(['monitoreo']);

  const permissions = user ? ROLE_PERMISSIONS[user.role] : [];
  const has = (id: string) => permissions.includes(id as MenuItem);

  const toggle = (id: string) =>
    setOpenMenus((p) => (p.includes(id) ? p.filter((m) => m !== id) : [...p, id]));

  return (
    <aside
      className={`
        flex flex-col bg-surface border-r border-border h-full min-h-screen flex-shrink-0
        transition-[width] duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-border min-h-[64px]">
        <div className="w-9 h-9 flex-shrink-0 rounded-[10px] bg-primary flex items-center justify-center shadow-[0_2px_10px_rgba(153,5,55,0.25)]">
          <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
            <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <path
              d="M16 5 L27 22 H5 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="11" r="2.5" fill="white" opacity="0.85" />
          </svg>
        </div>

        {!collapsed && (
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-text font-extrabold text-[0.95rem] whitespace-nowrap">
              UGEL Lampa
            </span>
            <span className="text-text-muted text-[0.63rem] whitespace-nowrap">
              Gestión Pedagógica
            </span>
          </div>
        )}

        {/* Botón colapsar — oculto en móvil (el overlay se cierra tocando afuera) */}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded-lg bg-bg border border-border text-text-muted hover:text-text hover:bg-border hidden md:flex flex-shrink-0 cursor-pointer transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {/* ── Tarjeta de usuario ── */}
      {!collapsed && user && (
        <div className="mx-2.5 my-3 px-3 py-2.5 rounded-xl bg-bg border border-border flex items-center gap-2.5">
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-[0.72rem] font-bold">
            {user.nombres[0]}
            {user.apellidos[0]}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-text text-[0.80rem] font-semibold truncate">
              {user.nombres} {user.apellidos}
            </span>
            <span className="text-text-muted text-[0.67rem]">{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
      )}

      {/* ── Navegación ── */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => has(item.id)).map((item) => {
          const visibleChildren = item.children.filter((c) => has(c.id));
          const isOpen = openMenus.includes(item.id);
          const isActive =
            activePage === item.id || visibleChildren.some((c) => c.id === activePage);

          const isJefeArea = user?.role === 'jefe_area';
          const displayLabel = item.id === 'instituciones_docentes'
            ? (isJefeArea ? 'Directores' : 'Docentes')
            : item.label;

          return (
            <div key={item.id}>
              <button
                onClick={() => (visibleChildren.length ? toggle(item.id) : onNavigate(item.id))}
                title={collapsed ? displayLabel : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border-none
                  cursor-pointer transition-all text-left text-[0.875rem] font-medium
                  ${
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'bg-transparent text-text-muted hover:bg-bg hover:text-text'
                  }
                `}
              >
                <span className="flex-shrink-0 flex">{item.icon}</span>
                {!collapsed && <span className="flex-1">{displayLabel}</span>}
                {!collapsed && visibleChildren.length > 0 && (
                  <span
                    className={`text-text-dim flex transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                )}
              </button>

              {!collapsed && isOpen && visibleChildren.length > 0 && (
                <div className="pl-10 flex flex-col gap-0.5 mt-0.5">
                  {visibleChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border-none
                        cursor-pointer text-left text-[0.82rem] transition-all bg-transparent
                        ${
                          activePage === child.id
                            ? 'text-primary font-semibold'
                            : 'text-text-muted hover:text-text hover:bg-bg'
                        }
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-2 border-t border-border flex flex-col gap-1">
        {!collapsed && (
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg border-none bg-transparent text-text-muted text-[0.78rem] cursor-pointer hover:bg-bg hover:text-text transition-colors text-left">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Soporte técnico
          </button>
        )}
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg border-none bg-transparent text-danger text-[0.84rem] cursor-pointer hover:bg-danger/10 transition-colors text-left"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};