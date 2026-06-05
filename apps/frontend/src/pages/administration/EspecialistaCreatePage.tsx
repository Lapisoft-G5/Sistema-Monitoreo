import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EspecialistaRol, NivelInstitucion } from '../../entities/specialist/specialist.types';
import {
  ROL_ESPECIALISTA_LABELS,
  NIVELES_INSTITUCION,
} from '../../entities/specialist/specialist.types';

interface Props {
  onBack?: () => void;
  onSuccess?: () => void;
}

interface FormData {
  nombres: string;
  dni: string;
  correo: string;
  celular: string;
  especialidad: string;
  rol: EspecialistaRol | '';
  niveles: NivelInstitucion[];
}

const EMPTY: FormData = {
  nombres: '',
  dni: '',
  correo: '',
  celular: '',
  especialidad: '',
  rol: '',
  niveles: [],
};

const ROLES: EspecialistaRol[] = ['especialista_admin', 'especialista_medio', 'especialista_bajo'];

const ROL_DESCRIPTIONS: Record<EspecialistaRol, string> = {
  especialista_admin:
    'Acceso completo: Dashboard, Monitoreo, Instituciones, Especialistas, Reportes y Configuración.',
  especialista_medio: 'Acceso a Dashboard, Monitoreo, Instituciones, Reportes y Configuración.',
  especialista_bajo: 'Acceso a Dashboard, Monitoreo, Reportes y Configuración.',
};

const inputClass = `
  w-full bg-bg border border-border rounded-xl outline-none text-text text-sm
  px-3 py-2.5 placeholder:text-text-dim
  focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all
`;

/* ==========================================================================
   COMPONENTE INTERNO: LÓGICA DE ESTADO Y MAQUETACIÓN DEL FORMULARIO
   ========================================================================== */
const EspecialistaCreatePageContent = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const toggleNivel = (n: NivelInstitucion) =>
    setForm((p) => ({
      ...p,
      niveles: p.niveles.includes(n) ? p.niveles.filter((x) => x !== n) : [...p.niveles, n],
    }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.nombres.trim()) e.nombres = 'El nombre es requerido';
    if (!/^\d{8}$/.test(form.dni)) e.dni = 'El DNI debe tener 8 dígitos';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido';
    if (!/^\d{9}$/.test(form.celular)) e.celular = 'El celular debe tener 9 dígitos';
    if (!form.especialidad.trim()) e.especialidad = 'La especialidad es requerida';
    if (!form.rol) e.rol = 'Seleccione un rol';
    if (form.niveles.length === 0) e.niveles = 'Seleccione al menos un nivel';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
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
          <h1 className="text-xl font-bold text-text">Nuevo Especialista</h1>
          <p className="text-text-muted text-sm">
            Complete los datos para registrar un nuevo especialista
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <p className="text-text-dim text-xs">Datos de identificación del especialista</p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombres */}
            <div className="sm:col-span-2">
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Nombres y Apellidos <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Carlos Pérez López"
                value={form.nombres}
                onChange={(e) => set('nombres', e.target.value)}
                className={inputClass}
              />
              {errors.nombres && <p className="text-danger text-xs mt-1">{errors.nombres}</p>}
            </div>

            {/* DNI */}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                DNI <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="12345678"
                value={form.dni}
                onChange={(e) => set('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                maxLength={8}
                className={`${inputClass} font-mono`}
              />
              {errors.dni && <p className="text-danger text-xs mt-1">{errors.dni}</p>}
            </div>

            {/* Celular */}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Núm. Celular <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="951234567"
                value={form.celular}
                onChange={(e) => set('celular', e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
                className={`${inputClass} font-mono`}
              />
              {errors.celular && <p className="text-danger text-xs mt-1">{errors.celular}</p>}
            </div>

            {/* Correo */}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Correo Electrónico <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder="ejemplo@ugel-lampa.gob.pe"
                value={form.correo}
                onChange={(e) => set('correo', e.target.value)}
                className={inputClass}
              />
              {errors.correo && <p className="text-danger text-xs mt-1">{errors.correo}</p>}
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Especialidad <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Matemática, Communication..."
                value={form.especialidad}
                onChange={(e) => set('especialidad', e.target.value)}
                className={inputClass}
              />
              {errors.especialidad && (
                <p className="text-danger text-xs mt-1">{errors.especialidad}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bloque 2: Configuración de Rol ── */}
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">Configuración de Rol</h2>
              <p className="text-text-dim text-xs">Define el nivel de acceso del especialista</p>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3">
            {ROLES.map((rol) => (
              <label
                key={rol}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  form.rol === rol
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-bg hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={rol}
                  checked={form.rol === rol}
                  onChange={() => set('rol', rol)}
                  className="mt-0.5 accent-primary cursor-pointer flex-shrink-0"
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${form.rol === rol ? 'text-primary' : 'text-text'}`}
                  >
                    {ROL_ESPECIALISTA_LABELS[rol]}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5 leading-relaxed">
                    {ROL_DESCRIPTIONS[rol]}
                  </p>
                </div>
              </label>
            ))}
            {errors.rol && <p className="text-danger text-xs">{errors.rol}</p>}
          </div>
        </div>

        {/* ── Bloque 3: Nivel de Institución ── */}
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
              <h2 className="text-sm font-bold text-text">Nivel de Institución</h2>
              <p className="text-text-dim text-xs">
                Seleccione uno o más niveles educativos asignados
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NIVELES_INSTITUCION.map((nivel) => {
                const checked = form.niveles.includes(nivel);
                return (
                  <label
                    key={nivel}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'border-success bg-success/5'
                        : 'border-border bg-bg hover:border-success/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleNivel(nivel)}
                      className="accent-success cursor-pointer flex-shrink-0"
                    />
                    <span
                      className={`text-sm font-medium ${checked ? 'text-success' : 'text-text'}`}
                    >
                      {nivel}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.niveles && <p className="text-danger text-xs mt-3">{errors.niveles}</p>}
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-surface border border-border text-text-muted hover:text-text hover:bg-bg text-sm font-medium rounded-xl cursor-pointer transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-xl border-none cursor-pointer disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Guardar Especialista
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ==========================================================================
   WRAPPER ENRUTADO: SE EJECUTA SÓLO EN EL CONTEXTO DE REACT ROUTER
   ========================================================================== */
const EspecialistaCreatePageRouter = () => {
  const navigate = useNavigate();
  return (
    <EspecialistaCreatePageContent
      onBack={() => navigate('/especialistas')}
      onSuccess={() => navigate('/especialistas')}
    />
  );
};

/* ==========================================================================
   COMPONENTE RAÍZ EXPORTADO (GATEKEEPER COMPLIANT)
   ========================================================================== */
export const EspecialistaCreatePage = ({ onBack, onSuccess }: Props) => {
  // Si se reciben callbacks explícitos, significa que opera bajo la UI condicional de develop
  if (onBack && onSuccess) {
    return <EspecialistaCreatePageContent onBack={onBack} onSuccess={onSuccess} />;
  }

  // De lo contrario, se asume el esquema de URL dinámico de feature/teachers-management
  return <EspecialistaCreatePageRouter />;
};