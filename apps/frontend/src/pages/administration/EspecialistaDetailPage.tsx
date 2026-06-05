import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ESPECIALISTAS } from '../../features/authentication/specialists.mock';
import { useAuth } from '../../features/authentication/useAuth';
import { isReadOnlyRole } from '../../shared/constants/roles';

interface Props {
  especialistaId?: string;
  onBack?: () => void;
  onNavigateEdit?: (id: string) => void;
}

const CAMPO = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-text text-sm font-medium">{value}</p>
  </div>
);

export const EspecialistaDetailPage = ({ especialistaId, onBack, onNavigateEdit }: Props) => {
  // Inicialización híbrida y segura del ecosistema de enrutamiento
  let navigate: ReturnType<typeof useNavigate> | null = null;
  let urlParams: Record<string, string | undefined> = {};
  
  try {
    navigate = useNavigate();
    urlParams = useParams<{ id: string }>();
  } catch (e) {
    // Silenciar error si se renderiza en un entorno sin RouterProvider
  }

  const { user } = useAuth();
  const isReadOnly = user ? isReadOnlyRole(user.role) : true;

  // Resolución del ID: Prioriza la propiedad explícita de develop, cae en useParams de la feature branch
  const targetId = especialistaId ?? urlParams.id;
  const esp = MOCK_ESPECIALISTAS.find((e) => e.id === targetId);

  // Manejo de redirecciones unificadas
  const handleBack = () => {
    if (onBack) onBack();
    else if (navigate) navigate('/especialistas');
  };

  const handleEdit = () => {
    if (onNavigateEdit && esp) onNavigateEdit(esp.id);
    else if (navigate && esp) navigate(`/especialistas/${esp.id}/editar`);
  };

  if (!esp) {
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
          <p className="text-text font-semibold mb-1">Especialista no encontrado</p>
          <button
            onClick={handleBack}
            className="text-primary text-sm underline cursor-pointer bg-transparent border-none"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
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
            <h1 className="text-xl font-bold text-text">Detalle de Especialista</h1>
            <p className="text-text-muted text-sm">Información completa del especialista</p>
          </div>
        </div>

        {/* Botón Editar — Oculto para roles con restricción de solo lectura */}
        {!isReadOnly && (
          <button
            onClick={handleEdit}
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
        )}

        {/* Badge Informativo de Solo Lectura */}
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

      {/* ── Tarjeta de perfil ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-hover h-20" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-8 mb-4 flex-wrap">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-surface flex items-center justify-center text-primary text-xl font-black shadow-sm flex-shrink-0">
              {esp.nombres.split(' ')[0][0]}
              {esp.nombres.split(' ')[1]?.[0]}
            </div>
            {/* Estado */}
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border mb-1 ${
                esp.activo
                  ? 'bg-success/10 text-success border-success/25'
                  : 'bg-border text-text-muted border-border'
              }`}
            >
              {esp.activo ? '● Activo' : '○ Inactivo'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-text">{esp.nombres}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-text-muted text-xs">
              Desde{' '}
              {new Date(esp.fechaCreacion).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bloque 1: Información Personal ── */}
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
            <CAMPO label="Nombres y Apellidos" value={esp.nombres} />
          </div>
          <CAMPO label="DNI" value={esp.dni} />
          <CAMPO label="Especialidad" value={esp.especialidad} />
          <CAMPO label="Correo Electrónico" value={esp.correo} />
          <CAMPO label="Núm. Celular" value={esp.celular} />
        </div>
      </div>

      {/* ── Bloque 2: Niveles de Institución ── */}
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Niveles de Institución</h2>
            <p className="text-text-dim text-xs">Niveles educativos asignados al especialista</p>
          </div>
        </div>

        <div className="p-5">
          {esp.niveles.length === 0 ? (
            <p className="text-text-muted text-sm">Sin niveles asignados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {esp.niveles.map((n) => (
                <span
                  key={n}
                  className="flex items-center gap-1.5 bg-success/10 text-success border border-success/25 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};