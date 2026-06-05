import { useMemo, useState } from 'react';
import type { EstadoMonitoreo, Institucion, Nivel } from './types';
import { ESTADOS, ESTADO_COLOR, getInitials, MOCK_INSTITUCIONES, NIVELES, NIVEL_STYLE } from './types';
import { InstitutionForm } from './InstitutionForm';
import { InstitutionEditForm } from './InstitutionEditForm';
import { ConfirmModal } from './ConfirmModal';

/* ============================================================
 * Padrón de Instituciones — Vista (datos mock)
 * Estilo y paleta alineados al mockup / DashboardPage.
 * El "Director asignado", el estado (Satisfactorio/En Proceso/Crítico)
 * y las métricas (Monitoreadas/Pendientes) son visuales por ahora;
 * se conectarán cuando exista el módulo de monitoreo y el CRUD real.
 * ============================================================ */

const bgApp = '#f8fafc';
const cardBg = '#ffffff';
const textPrimary = '#1e293b';
const textSecondary = '#64748b';
const accentBlue = '#0046c7';
const cardShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';
const borderLight = '1px solid #e2e8f0';

const PAGE_SIZE = 10;

const getPageNumbers = (total: number, current: number): (number | 'ellipsis')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

/* ---------- Iconos ---------- */
const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/* ---------- Subcomponentes ---------- */
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: textSecondary }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '10px 36px 10px 12px',
          borderRadius: 8,
          border: borderLight,
          background: cardBg,
          color: value ? textPrimary : textSecondary,
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: textSecondary, display: 'flex' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  </div>
);

const NivelBadge = ({ nivel }: { nivel: Nivel }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      padding: '3px 10px',
      borderRadius: 20,
      background: NIVEL_STYLE[nivel].bg,
      color: NIVEL_STYLE[nivel].color,
    }}
  >
    {nivel}
  </span>
);

const EstadoBadge = ({ estado }: { estado: EstadoMonitoreo }) => {
  const color = ESTADO_COLOR[estado];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', fontWeight: 600, color }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {estado}
    </span>
  );
};

const DirectorCell = ({ director }: { director: string | null }) => {
  if (!director) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: textSecondary, fontSize: '0.83rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="17" y1="8" x2="23" y2="14" />
          <line x1="23" y1="8" x2="17" y2="14" />
        </svg>
        Sin asignar
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#e0e7ff',
          color: '#4338ca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.72rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {getInitials(director)}
      </span>
      <span style={{ fontSize: '0.85rem', color: textPrimary }}>{director}</span>
    </span>
  );
};

const ActionButton = ({
  onClick,
  title,
  color,
  children,
}: {
  onClick: () => void;
  title: string;
  color: string;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 7,
      border: 'none',
      background: 'transparent',
      color,
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

const PageButton = ({
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: 32,
      height: 32,
      padding: '0 8px',
      borderRadius: 8,
      border: active ? 'none' : borderLight,
      background: active ? accentBlue : cardBg,
      color: active ? '#ffffff' : disabled ? '#cbd5e1' : textSecondary,
      fontSize: '0.82rem',
      fontWeight: 600,
      cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </button>
);

/* ---------- Página ---------- */
export const InstitutionsPage = () => {
  const [instituciones, setInstituciones] = useState<Institucion[]>(MOCK_INSTITUCIONES);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<Institucion | null>(null);
  const [deletingInst, setDeletingInst] = useState<Institucion | null>(null);
  const [nivelFilter, setNivelFilter] = useState('');
  const [distritoFilter, setDistritoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const distritos = useMemo(
    () => [...new Set(instituciones.map((i) => i.distrito))].sort((a, b) => a.localeCompare(b)),
    [instituciones],
  );

  const filtered = useMemo(
    () =>
      instituciones.filter(
        (i) =>
          (!nivelFilter || i.nivel === nivelFilter) &&
          (!distritoFilter || i.distrito === distritoFilter) &&
          (!estadoFilter || i.estado === estadoFilter),
      ),
    [instituciones, nivelFilter, distritoFilter, estadoFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const handleSaveNew = (inst: Institucion) => {
    setInstituciones((prev) => [inst, ...prev]);
    setView('list');
    setPage(1);
  };
  const handleUpdate = (inst: Institucion) => {
    setInstituciones((prev) => prev.map((i) => (i.id === inst.id ? inst : i)));
    setView('list');
    setEditing(null);
  };
  const handleView = (inst: Institucion) => {
    // TODO: vista de detalle de la institución
    console.log('TODO: ver institución', inst.codigoModular);
  };
  const handleEdit = (inst: Institucion) => {
    setEditing(inst);
    setView('edit');
  };
  const handleDelete = (inst: Institucion) => {
    setDeletingInst(inst);
  };
  const confirmDelete = () => {
    if (!deletingInst) return;
    setInstituciones((prev) => prev.filter((i) => i.id !== deletingInst.id));
    setDeletingInst(null);
  };

  if (view === 'create') {
    return <InstitutionForm onCancel={() => setView('list')} onSubmit={handleSaveNew} />;
  }
  if (view === 'edit' && editing) {
    return (
      <InstitutionEditForm
        institucion={editing}
        onCancel={() => {
          setView('list');
          setEditing(null);
        }}
        onSubmit={handleUpdate}
      />
    );
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: textSecondary,
    padding: '0 16px 12px',
    borderBottom: '2px solid #f1f5f9',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.85rem',
    color: textPrimary,
  };

  return (
    <div
      style={{
        background: bgApp,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        color: textPrimary,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary }}>Gestión de Instituciones</h1>
          <p style={{ margin: '4px 0 0', color: textSecondary, fontSize: '0.87rem' }}>
            Administración del padrón oficial de II.EE.
          </p>
        </div>
        <button
          onClick={() => setView('create')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: accentBlue,
            color: '#ffffff',
            fontSize: '0.87rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,70,199,0.25)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Nueva Institución
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* Total */}
        <div style={{ background: cardBg, border: borderLight, boxShadow: cardShadow, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: textSecondary }}>
              Total II.EE.
            </span>
            <span style={{ color: accentBlue, display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </span>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>342</span>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#137333' }}>↗ +2 este mes</span>
          </div>
        </div>

        {/* Monitoreadas */}
        <div style={{ background: cardBg, border: borderLight, boxShadow: cardShadow, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: textSecondary }}>
              Monitoreadas
            </span>
            <span style={{ color: '#22c55e', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>285</span>
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '83%', background: '#22c55e', borderRadius: 4 }} />
            </div>
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: textSecondary }}>83% del total general</span>
          </div>
        </div>

        {/* Pendientes */}
        <div style={{ background: cardBg, border: borderLight, boxShadow: cardShadow, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: textSecondary }}>
              Pendientes
            </span>
            <span style={{ color: '#f97316', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>57</span>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444' }}>! Requieren atención</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: cardBg, border: borderLight, boxShadow: cardShadow, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <FilterSelect
            label="Nivel educativo"
            value={nivelFilter}
            onChange={(v) => {
              setNivelFilter(v);
              setPage(1);
            }}
            options={NIVELES}
            allLabel="Todos los niveles"
          />
          <FilterSelect
            label="Distrito"
            value={distritoFilter}
            onChange={(v) => {
              setDistritoFilter(v);
              setPage(1);
            }}
            options={distritos}
            allLabel="Todos los distritos"
          />
          <FilterSelect
            label="Estado"
            value={estadoFilter}
            onChange={(v) => {
              setEstadoFilter(v);
              setPage(1);
            }}
            options={ESTADOS}
            allLabel="Todas"
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: cardBg, border: borderLight, boxShadow: cardShadow, borderRadius: 12, padding: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Código Modular</th>
                <th style={thStyle}>Nombre de la I.E.</th>
                <th style={thStyle}>Nivel</th>
                <th style={thStyle}>Distrito</th>
                <th style={thStyle}>Director Asignado</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((inst, i) => (
                <tr key={inst.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{inst.codigoModular}</td>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 600, color: textPrimary }}>{inst.nombre}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: textSecondary }}>{inst.direccion}</p>
                  </td>
                  <td style={tdStyle}>
                    <NivelBadge nivel={inst.nivel} />
                  </td>
                  <td style={tdStyle}>{inst.distrito}</td>
                  <td style={tdStyle}>
                    <DirectorCell director={inst.director} />
                  </td>
                  <td style={tdStyle}>
                    <EstadoBadge estado={inst.estado} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <ActionButton onClick={() => handleView(inst)} title="Ver detalle" color={textSecondary}>
                        <IconEye />
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(inst)} title="Editar" color={accentBlue}>
                        <IconEdit />
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(inst)} title="Eliminar" color="#ef4444">
                        <IconTrash />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: textSecondary, padding: '40px 16px' }}>
                    No se encontraron instituciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: borderLight,
          }}
        >
          <span style={{ fontSize: '0.82rem', color: textSecondary }}>
            Mostrando {from}-{to} de {filtered.length} instituciones
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PageButton disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </PageButton>
            {getPageNumbers(totalPages, currentPage).map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`e${idx}`} style={{ padding: '0 6px', color: textSecondary }}>
                  …
                </span>
              ) : (
                <PageButton key={p} active={p === currentPage} onClick={() => setPage(p)}>
                  {p}
                </PageButton>
              ),
            )}
            <PageButton disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </PageButton>
          </div>
        </div>
      </div>

      {deletingInst && (
        <ConfirmModal
          danger
          title="¿Eliminar Institución?"
          message="Esta acción es irreversible y eliminará el registro del padrón oficial. Asegúrese de que no existen dependencias activas."
          confirmLabel="Eliminar Registro"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingInst(null)}
        />
      )}
    </div>
  );
};
