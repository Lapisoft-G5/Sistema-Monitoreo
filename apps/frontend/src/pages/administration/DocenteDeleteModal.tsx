import type { Docente } from '../../entities/teacher/teacher.types';

interface Props {
  docente: Docente;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DocenteDeleteModal = ({ docente, onConfirm, onCancel }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/20 backdrop-blur-sm px-4">
    <div className="w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-danger via-danger/80 to-warning" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/25 flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-danger"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-text font-bold text-base mb-1">Eliminar Docente</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            ¿Está seguro que desea eliminar a{' '}
            <strong className="text-text">{docente.nombres}</strong>?
          </p>
        </div>

        <div className="bg-bg border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">DNI</span>
            <span className="text-text font-mono font-semibold">{docente.dni}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Especialidad</span>
            <span className="text-text font-semibold">{docente.especialidad}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Condición</span>
            <span className="text-text font-semibold">{docente.condicion}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Secciones</span>
            <span className="text-text font-semibold">
              {docente.secciones.map((s) => s.grado).join(', ')}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-danger/5 border border-danger/20 rounded-xl px-3.5 py-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-danger flex-shrink-0 mt-0.5"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-danger text-xs leading-relaxed">
            Esta acción es irreversible. Se eliminarán todos los datos y registros asociados a este
            docente.
          </p>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-surface border border-border text-text-muted hover:text-text hover:bg-bg text-sm font-medium rounded-xl cursor-pointer transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-danger hover:bg-danger/90 text-white text-sm font-bold rounded-xl border-none cursor-pointer transition-all"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
);
