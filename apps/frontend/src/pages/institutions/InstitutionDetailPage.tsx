import type { Institucion } from './types';
import { NIVEL_LABEL, ESTADO_COLOR } from './types';

interface Props {
  institucion: Institucion;
  onBack: () => void;
  onEdit: () => void;
}

const CAMPO = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-text text-sm font-medium">{value}</p>
  </div>
);

export const InstitutionDetailPage = ({ institucion, onBack, onEdit }: Props) => {
  const estadoColor = ESTADO_COLOR[institucion.estado] || '#64748b';

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
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
            <h1 className="text-xl font-bold text-text">Detalle de Institución</h1>
            <p className="text-text-muted text-sm">Información del padrón oficial de la I.E.</p>
          </div>
        </div>
        <button
          onClick={onEdit}
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
            {/* Logo/Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-surface flex items-center justify-center text-primary text-xl font-black shadow-sm flex-shrink-0">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            {/* Estado */}
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full border mb-1 flex items-center gap-1.5"
              style={{
                backgroundColor: `${estadoColor}10`,
                borderColor: `${estadoColor}25`,
                color: estadoColor,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: estadoColor }} />
              {institucion.estado}
            </span>
          </div>
          <h2 className="text-lg font-bold text-text">{institucion.nombre}</h2>
          <p className="text-text-muted text-xs mt-1">
            Código Modular: <strong className="font-mono text-text">{institucion.codigoModular}</strong>
          </p>
        </div>
      </div>

      {/* ── Información de Ubicación y Nivel ── */}
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Información de la Institución</h2>
            <p className="text-text-dim text-xs">Identificación y ubicación de la I.E.</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CAMPO label="Código Modular" value={institucion.codigoModular} />
          <CAMPO label="Nivel Educativo" value={NIVEL_LABEL[institucion.nivel] || institucion.nivel} />
          <div className="sm:col-span-2">
            <CAMPO label="Dirección" value={institucion.direccion} />
          </div>
          <CAMPO label="Distrito" value={institucion.distrito} />
          <CAMPO label="Provincia" value={institucion.provincia || 'Lampa'} />
          <CAMPO label="Zona" value={institucion.zona || 'Urbana'} />
        </div>
      </div>

      {/* ── Director Asignado ── */}
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Director de la I.E.</h2>
            <p className="text-text-dim text-xs">Datos de contacto del directivo asignado</p>
          </div>
        </div>
        <div className="p-5">
          {institucion.director ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <CAMPO label="Director Asignado" value={institucion.director} />
              </div>
              <CAMPO label="Celular de Contacto" value={institucion.directorTelefono || 'Sin teléfono registrado'} />
              <CAMPO label="Correo Electrónico" value={institucion.directorCorreo || 'Sin correo registrado'} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center mb-3 text-warning">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p className="text-text font-bold text-sm">Sin director asignado</p>
              <p className="text-text-muted text-xs mt-1 max-w-sm">
                Esta institución no cuenta actualmente con un director asignado en el padrón. Puede asignar uno editando este registro.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
