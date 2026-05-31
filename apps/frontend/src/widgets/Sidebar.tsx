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
    id: 'instituciones',
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
    children: [
      { id: 'instituciones_padron', label: 'Padrón de Instituciones' },
      { id: 'instituciones_docentes', label: 'Padrón de Docentes' },
    ],
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

  /* Paleta Light Mode adaptada exactamente al Mockup */
  const sidebarBg = '#ffffff';
  const borderCol = '#e2e8f0';
  const activeText = '#0f52ba';
  const activeBg = '#f0f5ff';
  const mutedText = '#64748b';

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: sidebarBg,
        borderRight: `1px solid ${borderCol}`,
        minHeight: '100vh',
        width: collapsed ? 68 : 240,
        transition: 'width 0.25s ease',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 16px',
          borderBottom: `1px solid ${borderCol}`,
          minHeight: 72,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0f52ba, #3b6ff5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(15,82,186,0.2)',
          }}
        >
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
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <span
              style={{
                color: 'var(--color-text)',
                fontWeight: 800,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
              }}
            >
              UGEL Lampa
            </span>
            <span
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.63rem',
                whiteSpace: 'nowrap',
              }}
            >
              Gestión Pedagógica
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            marginLeft: 'auto',
            padding: 6,
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            flexShrink: 0,
          }}
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

      {/* Tarjeta de Usuario integrada */}
      {!collapsed && user && (
        <div
          style={{
            margin: '12px 10px',
            padding: '10px 12px',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#0f52ba,#3b6ff5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {user.nombres[0]}
            {user.apellidos[0]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                color: 'var(--color-text)',
                fontSize: '0.80rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.nombres} {user.apellidos}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.67rem' }}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      )}

      {/* Navegación principal */}
      <nav
        style={{
          flex: 1,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {NAV_ITEMS.filter((item) => has(item.id)).map((item) => {
          const visibleChildren = item.children.filter((c) => has(c.id));
          const isOpen = openMenus.includes(item.id);
          const isActive =
            activePage === item.id || visibleChildren.some((c) => c.id === activePage);

          return (
            <div key={item.id}>
              <button
                onClick={() => (visibleChildren.length ? toggle(item.id) : onNavigate(item.id))}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? activeBg : 'transparent',
                  color: isActive ? activeText : mutedText,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && visibleChildren.length > 0 && (
                  <span
                    style={{
                      color: 'var(--color-text-dim)',
                      display: 'flex',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
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
                <div
                  style={{
                    paddingLeft: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  {visibleChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                        textAlign: 'left',
                        fontSize: '0.82rem',
                        color: activePage === child.id ? '#0f52ba' : 'var(--color-text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'currentColor',
                          flexShrink: 0,
                        }}
                      />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div
        style={{
          padding: '8px',
          borderTop: `1px solid ${borderCol}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {!collapsed && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: '0.84rem',
            cursor: 'pointer',
            borderRadius: 8,
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
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
