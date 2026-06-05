import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ESPECIALISTAS } from '../../features/authentication/specialists.mock';
import type { Especialista } from '../../entities/specialist/specialist.types';
import { ROL_ESPECIALISTA_LABELS } from '../../entities/specialist/specialist.types';
import { EspecialistaDeleteModal } from './EspecialistaDeleteModal';
import { useAuth } from '../../features/authentication/useAuth';
import { isReadOnlyRole } from '../../shared/constants/roles';

const ROL_COLORS: Record<string, string> = {
  especialista_admin: 'bg-primary/10 text-primary border-primary/25',
  especialista_medio: 'bg-warning/10 text-warning border-warning/25',
  especialista_bajo: 'bg-success/10 text-success border-success/25',
};

export const EspecialistasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si el rol es de solo lectura, oculta todos los controles de escritura
  const isReadOnly = user ? isReadOnlyRole(user.role) : true;

  const [lista, setLista] = useState<Especialista[]>(MOCK_ESPECIALISTAS);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [deleteTarget, setDeleteTarget] = useState<Especialista | null>(null);

  const filtrados = lista.filter((e) => {
    const matchBusqueda =
      e.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.dni.includes(busqueda) ||
      e.especialidad.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === 'todos' || e.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  const handleDelete = (id: string) => {
    setLista((prev) => prev.filter((e) => e.id !== id));
    setDeleteTarget(null);
  };

  const toggleActivo = (id: string) =>
    setLista((prev) => prev.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e)));

  const total = lista.length;
  const activos = lista.filter((e) => e.activo).length;
  const enMonitoreo = lista.filter((e) => e.activo && e.niveles.length > 0).length;

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Especialistas</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {isReadOnly
              ? 'Vista de solo lectura del equipo de especialistas'
              : 'Gestión del equipo de especialistas de monitoreo'}
          </p>
        </div>

        {/* Botón "Nuevo" — solo para roles con escritura */}
        {!isReadOnly && (
          <button
            onClick={() => navigate('/especialistas/nuevo')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-colors shadow-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Especialista
          </button>
        )}

        {/* Badge informativo para invitado */}
        {isReadOnly && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/25 rounded-lg text-xs font-semibold">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Solo lectura
          </span>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
              Total Especialistas
            </p>
            <p className="text-3xl font-black text-text">{String(total).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#e8edf7] flex items-center justify-center flex-shrink-0">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a6fa5"
              strokeWidth="1.8"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
              Activos
            </p>
            <p className="text-3xl font-black text-success">{String(activos).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-success"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
          </div>
        </div>

        <div className="bg-text rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-white/60 text-[0.68rem] font-bold uppercase tracking-wider mb-1">
              En Monitoreo
            </p>
            <p className="text-3xl font-black text-white">{String(enMonitoreo).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Búsqueda y filtros ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface border border-border rounded-xl px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-dim flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text text-sm py-2.5 placeholder:text-text-dim"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="text-text-dim hover:text-text cursor-pointer bg-transparent border-none"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none cursor-pointer focus:border-primary transition-colors"
        >
          <option value="todos">Todos los roles</option>
          <option value="especialista_admin">Admin</option>
          <option value="especialista_medio">Medio</option>
          <option value="especialista_bajo">Bajo</option>
        </select>
      </div>

      {/* ── Contador ── */}
      <p className="text-text-muted text-xs -mt-1">
        Mostrando <strong className="text-text">{filtrados.length}</strong> de{' '}
        <strong className="text-text">{lista.length}</strong> especialistas
      </p>

      {/* ── Tabla ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg">
                {[
                  'Especialista',
                  'DNI',
                  'Contacto',
                  'Especialidad',
                  'Rol',
                  'Niveles',
                  'Estado',
                  // Columna acciones solo si no es read-only
                  ...(!isReadOnly ? ['Acciones'] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[0.68rem] font-bold uppercase tracking-wide text-text-muted px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={isReadOnly ? 7 : 8}
                    className="px-4 py-12 text-center text-text-muted text-sm"
                  >
                    No se encontraron especialistas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtrados.map((esp, i) => (
                  <tr
                    key={esp.id}
                    className={`border-b border-border transition-colors hover:bg-bg ${i % 2 !== 0 ? 'bg-bg/50' : ''}`}
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {esp.nombres.split(' ')[0][0]}
                          {esp.nombres.split(' ')[1]?.[0]}
                        </div>
                        <span className="text-sm font-medium text-text whitespace-nowrap">
                          {esp.nombres}
                        </span>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="px-4 py-3.5 text-sm text-text-muted font-mono">{esp.dni}</td>

                    {/* Contacto */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-text">{esp.correo}</p>
                      <p className="text-xs text-text-muted mt-0.5">{esp.celular}</p>
                    </td>

                    {/* Especialidad */}
                    <td className="px-4 py-3.5 text-sm text-text">{esp.especialidad}</td>

                    {/* Rol */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${ROL_COLORS[esp.rol]}`}
                      >
                        {ROL_ESPECIALISTA_LABELS[esp.rol]}
                      </span>
                    </td>

                    {/* Niveles */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {esp.niveles.map((n) => (
                          <span
                            key={n}
                            className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-md bg-border text-text-muted"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Estado — deshabilitado en read-only */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => !isReadOnly && toggleActivo(esp.id)}
                        disabled={isReadOnly}
                        title={isReadOnly ? 'Sin permisos de edición' : undefined}
                        className={`
                          relative inline-flex h-5 w-9 items-center rounded-full border-none transition-colors
                          ${esp.activo ? 'bg-success' : 'bg-border'}
                          ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${esp.activo ? 'translate-x-4' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </td>

                    {/* Acciones — columna completa solo si no es read-only */}
                    {!isReadOnly && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/especialistas/${esp.id}`)}
                            title="Ver detalle"
                            className="p-1.5 rounded-lg text-text-muted hover:text-[#4a6fa5] hover:bg-[#e8edf7] transition-all cursor-pointer bg-transparent border-none"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/especialistas/${esp.id}/editar`)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all cursor-pointer bg-transparent border-none"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(esp)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal eliminar ── */}
      {!isReadOnly && deleteTarget && (
        <EspecialistaDeleteModal
          especialista={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
