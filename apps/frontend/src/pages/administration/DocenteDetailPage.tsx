import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_DOCENTES } from '../../entities/teacher/teacher.mock';
import { ESCALAS_MAGISTERIALES } from '../../entities/teacher/teacher.types';

const CONDICION_COLORS: Record<string, string> = {
  Nombrado: 'bg-primary/10 text-primary border-primary/25',
  Contratado: 'bg-warning/10 text-warning border-warning/25',
};

const CAMPO = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-text text-sm font-medium">{value}</p>
  </div>
);

export const DocenteDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const doc = MOCK_DOCENTES.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/25 flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-danger"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-text font-semibold mb-1">Docente no encontrado</p>
          <button
            onClick={() => navigate('/docentes')}
            className="text-primary text-sm underline cursor-pointer bg-transparent border-none"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const escalaLabel =
    ESCALAS_MAGISTERIALES.find((e) => e.value === doc.escala)?.label ?? doc.escala;

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-text">Detalle de Docente</h1>
            <p className="text-text-muted text-sm">Información completa del docente</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/docentes/${doc.id}/editar`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-colors shadow-sm"
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
          Editar
        </button>
      </div>

      {/* ── Tarjeta de perfil ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-hover h-20" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-8 mb-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-surface flex items-center justify-center text-primary text-xl font-black shadow-sm flex-shrink-0">
              {doc.nombres.split(' ')[0][0]}
              {doc.nombres.split(' ')[1]?.[0]}
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border mb-1 ${doc.activo ? 'bg-success/10 text-success border-success/25' : 'bg-border text-text-muted border-border'}`}
            >
              {doc.activo ? '● Activo' : '○ Inactivo'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-text">{doc.nombres}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full border ${CONDICION_COLORS[doc.condicion]}`}
            >
              {doc.condicion}
            </span>
            <span className="text-text-muted text-xs">
              · Desde{' '}
              {new Date(doc.fechaCreacion).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Información Personal ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Información Personal</h2>
            <p className="text-text-dim text-xs">Datos de identificación</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <CAMPO label="Nombres y Apellidos" value={doc.nombres} />
          </div>
          <CAMPO label="DNI" value={doc.dni} />
          <CAMPO label="Núm. Celular" value={doc.celular} />
          <div className="sm:col-span-2">
            <CAMPO label="Correo Electrónico" value={doc.correo} />
          </div>
        </div>
      </div>

      {/* ── Detalles Laborales ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg">
          <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Detalles Laborales</h2>
            <p className="text-text-dim text-xs">Información sobre la función del docente</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CAMPO label="Nivel Educativo" value={doc.nivelEducativo} />
          <CAMPO label="Condición Laboral" value={doc.condicion} />
          <CAMPO label="Especialidad Principal" value={doc.especialidad} />
          <CAMPO label="Carga Horaria" value={`${doc.cargaHoraria} horas/semana`} />
          <div className="sm:col-span-2">
            <CAMPO label="Escala Magisterial" value={escalaLabel} />
          </div>
        </div>
      </div>

      {/* ── Secciones a cargo ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg">
          <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Grado / Secciones a Cargo</h2>
            <p className="text-text-dim text-xs">
              {doc.secciones.length} sección{doc.secciones.length !== 1 ? 'es' : ''} asignada
              {doc.secciones.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="p-5">
          {doc.secciones.length === 0 ? (
            <p className="text-text-muted text-sm">Sin secciones asignadas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {doc.secciones.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 bg-success/10 text-success border border-success/25 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {s.grado}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
