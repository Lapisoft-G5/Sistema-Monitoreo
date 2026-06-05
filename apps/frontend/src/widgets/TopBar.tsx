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
}

export const TopBar = ({ activePage }: Props) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Estado local para alternar entre propuestas de diseño en desarrollo
  const [viewMode, setViewMode] = useState<'tailwind' | 'inline'>('tailwind');

  const title = PAGE_TITLES[activePage] ?? 'UGEL Lampa';

  /* Colores Light Mode (propios de la rama develop) */
  const bgInline = 'rgba(255, 255, 255, 0.95)';
  const borderInline = '#e2e8f0';

  return (
    <>
      {viewMode === 'tailwind' ? (
        /* ==========================================================================
           OPCIÓN A: ESTRUCTURA CON TAILWIND CSS (feature/specialists-management)
           ========================================================================== */
        <header className="h-16 flex items-center justify-between px-6 bg-surface/95 border-b border-border backdrop-blur-xl sticky top-0 z-50">
          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-2 text-[0.83rem]">
            <span className="text-text-muted">UGEL Lampa</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-dim"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-text font-semibold">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Switcher rápido de diseño embebido temporalmente para QA */}
            <button 
              onClick={() => setViewMode('inline')}
              className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded hover:bg-slate-300 transition-colors mr-2 border-none cursor-pointer"
              title="Cambiar a vista de estilos inline (develop)"
            >
              Ver versión Inline
            </button>

            {/* ── Notificaciones ── */}
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

            {/* ── Ayuda ── */}
            <button className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer bg-transparent border-none">
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

            {/* ── Usuario ── */}
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2.5 px-3 py-[7px] bg-bg border border-border rounded-[10px] cursor-pointer hover:bg-border transition-colors"
              >
                <div className="w-7 h-7 rounded-full flex-shrink-0 bg-primary flex items-center justify-center text-white text-[0.68rem] font-bold">
                  {user?.nombres?.[0] ?? 'U'}
                  {user?.apellidos?.[0] ?? 'E'}
                </div>
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
                  className="text-text-muted"
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
      ) : (
        /* ==========================================================================
           OPCIÓN B: ESTRUCTURA CON ESTILOS INLINE (develop)
           ========================================================================== */
        <header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: bgInline,
            borderBottom: `1px solid ${borderInline}`,
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            fontFamily: 'sans-serif'
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>UGEL Lampa</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-dim)"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Switcher rápido de diseño embebido temporalmente para QA */}
            <button 
              onClick={() => setViewMode('tailwind')}
              style={{ fontSize: '10px', background: '#e2e8f0', color: '#334155', fontWeight: 'bold', padding: '4px 8px', borderRadius: 4, marginRight: 8, border: 'none', cursor: 'pointer' }}
              title="Cambiar a vista con clases utilitarias de Tailwind (specialists-management)"
            >
              Ver versión Tailwind
            </button>

            {/* Notificaciones */}
            <button
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 8,
                color: 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
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
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '2px solid white',
                }}
              />
            </button>

            {/* Ayuda */}
            <button
              style={{
                padding: 8,
                borderRadius: 8,
                color: 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
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

            {/* Selector de Usuario Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg,#0f52ba,#3b6ff5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.nombres?.[0] ?? 'U'}
                  {user?.apellidos?.[0] ?? 'E'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span
                    style={{
                      color: 'var(--color-text)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.nombres} {user?.apellidos}
                  </span>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.65rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user ? ROLE_LABELS[user.role] : ''}
                  </span>
                </div>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {open && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 6,
                    width: 160,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 50
                  }}
                >
                  <button
                    onClick={logout}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-danger)',
                      textAlign: 'left',
                      fontSize: '0.83rem',
                      cursor: 'pointer',
                      borderRadius: 6,
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
    </>
  );
};