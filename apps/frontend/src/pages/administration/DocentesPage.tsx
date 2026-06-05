import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DOCENTES } from '../../entities/teacher/teacher.mock';
import type { Docente } from '../../entities/teacher/teacher.types';
import { DocenteDeleteModal } from './DocenteDeleteModal';
import { useAuth } from '../../features/authentication/useAuth';

const CONDICION_COLORS: Record<string, string> = {
  Nombrado: 'bg-primary/10 text-primary border-primary/25',
  Contratado: 'bg-warning/10 text-warning border-warning/25',
};

export const DocentesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isJefeArea = user?.role === 'jefe_area';

  const [lista, setLista] = useState<Docente[]>(MOCK_DOCENTES);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCondicion, setFiltroCondicion] = useState('todos');
  const [deleteTarget, setDeleteTarget] = useState<Docente | null>(null);

  // Filtrar según rol primero
  const roleFilteredLista = useMemo(() => {
    if (isJefeArea) {
      // Jefe de Área solo ve Directores y Coordinadores Pedagógicos
      return lista.filter((d) => d.cargo === 'Director' || d.cargo === 'Coordinador Pedagógico');
    } else {
      // Director de IE ve solo docentes regulares
      return lista.filter((d) => d.cargo !== 'Director' && d.cargo !== 'Coordinador Pedagógico');
    }
  }, [lista, isJefeArea]);

  const filtrados = roleFilteredLista.filter((d) => {
    const matchBusqueda =
      d.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.dni.includes(busqueda) ||
      d.especialidad.toLowerCase().includes(busqueda.toLowerCase());
    const matchCondicion = filtroCondicion === 'todos' || d.condicion === filtroCondicion;
    return matchBusqueda && matchCondicion;
  });

  const handleDelete = (id: string) => {
    setLista((prev) => prev.filter((d) => d.id !== id));
    setDeleteTarget(null);
  };
  const toggleActivo = (id: string) =>
    setLista((prev) => prev.map((d) => (d.id === id ? { ...d, activo: !d.activo } : d)));

  const total = roleFilteredLista.length;
  const nombrados = roleFilteredLista.filter((d) => d.condicion === 'Nombrado').length;
  const contratados = roleFilteredLista.filter((d) => d.condicion === 'Contratado').length;

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">
            {isJefeArea ? 'Gestión de Directores y Coordinadores' : 'Padrón de Docentes'}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {isJefeArea
              ? 'Administración de directores de I.E. y coordinadores pedagógicos'
              : 'Gestión del personal docente de la institución educativa'}
          </p>
        </div>
        <button
          onClick={() => navigate('/instituciones/docentes/nuevo')}
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
          {isJefeArea ? 'Nuevo Directivo' : 'Nuevo Docente'}
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
              {isJefeArea ? 'Total Directivos' : 'Total Docentes'}
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
              Nombrados
            </p>
            <p className="text-3xl font-black text-primary">{String(nombrados).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-primary"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        <div className="bg-text rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-white/60 text-[0.68rem] font-bold uppercase tracking-wider mb-1">
              Contratados
            </p>
            <p className="text-3xl font-black text-white">{String(contratados).padStart(2, '0')}</p>
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
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Búsqueda y filtros ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-surface border border-border rounded-xl px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
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
            placeholder={isJefeArea ? "Buscar por nombre, DNI o cargo..." : "Buscar por nombre, DNI o especialidad..."}
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
          value={filtroCondicion}
          onChange={(e) => setFiltroCondicion(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none cursor-pointer focus:border-primary transition-colors"
        >
          <option value="todos">Todas las condiciones</option>
          <option value="Nombrado">Nombrado</option>
          <option value="Contratado">Contratado</option>
        </select>
      </div>

      <p className="text-text-muted text-xs -mt-1">
        Mostrando <strong className="text-text">{filtrados.length}</strong> de{' '}
        <strong className="text-text">{roleFilteredLista.length}</strong> {isJefeArea ? 'directivos' : 'docentes'}
      </p>

      {/* ── Tabla ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg">
                {[
                  isJefeArea ? 'Directivo' : 'Docente',
                  'DNI',
                  'Contacto',
                  isJefeArea ? 'Cargo' : 'Especialidad',
                  'Nivel',
                  'Condición',
                  'Secciones',
                  'Estado',
                  'Acciones',
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
                  <td colSpan={9} className="px-4 py-12 text-center text-text-muted text-sm">
                    No se encontraron {isJefeArea ? 'directivos' : 'docentes'} con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtrados.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`border-b border-border transition-colors hover:bg-bg ${i % 2 !== 0 ? 'bg-bg/50' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {d.nombres.split(' ')[0][0]}
                          {d.nombres.split(' ')[1]?.[0]}
                        </div>
                        <span className="text-sm font-medium text-text whitespace-nowrap">
                          {d.nombres}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-muted font-mono">{d.dni}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-text">{d.correo}</p>
                      <p className="text-xs text-text-muted mt-0.5">{d.celular}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text whitespace-nowrap">
                      {isJefeArea ? d.cargo : d.especialidad}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-md bg-border text-text-muted">
                        {d.nivelEducativo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${CONDICION_COLORS[d.condicion]}`}
                      >
                        {d.condicion}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {d.secciones.slice(0, 2).map((s) => (
                          <span
                            key={s.id}
                            className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-md bg-border text-text-muted whitespace-nowrap"
                          >
                            {s.grado}
                          </span>
                        ))}
                        {d.secciones.length > 2 && (
                          <span className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-md bg-border text-text-dim">
                            +{d.secciones.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActivo(d.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full border-none cursor-pointer transition-colors ${d.activo ? 'bg-success' : 'bg-border'}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${d.activo ? 'translate-x-4' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/instituciones/docentes/${d.id}`)}
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
                          onClick={() => navigate(`/instituciones/docentes/${d.id}/editar`)}
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
                          onClick={() => setDeleteTarget(d)}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DocenteDeleteModal
          docente={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
