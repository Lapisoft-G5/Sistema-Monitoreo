import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ESPECIALISTAS } from '../../features/authentication/specialists.mock';
import type { EspecialistaRol, NivelInstitucion } from '../../entities/specialist/specialist.types';
import {
  ROL_ESPECIALISTA_LABELS,
  NIVELES_INSTITUCION,
} from '../../entities/specialist/specialist.types';

interface Props {
  especialistaId?: string;
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

// Construye el FormData inicial fuera del componente — sin useEffect
const buildInitialForm = (id: string): FormData | null => {
  const found = MOCK_ESPECIALISTAS.find((e) => e.id === id);
  if (!found) return null;
  return {
    nombres: found.nombres,
    dni: found.dni,
    correo: found.correo,
    celular: found.celular,
    especialidad: found.especialidad,
    rol: found.rol,
    niveles: [...found.niveles],
  };
};

export const EspecialistaEditPage = ({ especialistaId, onBack, onSuccess }: Props) => {
  // Inicialización segura del Router para evitar caídas en entornos sin RouterProvider
  let navigate: ReturnType<typeof useNavigate> | null = null;
  let urlParams: Record<string, string | undefined> = {};
  
  try {
    navigate = useNavigate();
    urlParams = useParams<{ id: string }>();
  } catch (e) {
    // Contexto independiente de React Router DOM
  }

  // Resolución del identificador dinámico de ambas ramas
  const targetId = especialistaId ?? urlParams.id ?? '';

  // useState con initializer function — se ejecuta solo en el primer render, sin useEffect
  const [form, setForm] = useState<FormData | null>(() => buildInitialForm(targetId));
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Manejo unificado de retornos y navegación
  const handleBack = () => {
    if (onBack) onBack();
    else if (navigate) navigate(-1);
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    else if (navigate) navigate('/especialistas');
  };

  // Si no se encontró el especialista, renderizamos el estado de error directamente
  if (form === null) {
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
          <p className="text-text-muted text-sm mb-4">
            El especialista con ID <span className="font-mono text-text">{targetId}</span> no existe.
          </p>
          <button
            onClick={handleBack}
            className="text-primary text-sm underline cursor-pointer bg-transparent border-none hover:text-primary-hover transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const set = (field: keyof FormData, value: string) =>
    setForm((p) => (p ? { ...p, [field]: value } : p));

  const toggleNivel = (n: NivelInstitucion) =>
    setForm((p) => {
      if (!p) return p;
      return {
        ...p,
        niveles: p.niveles.includes(n) ? p.niveles.filter((x) => x !== n) : [...p.niveles, n],
      };
    });

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
    handleSuccess();
  };

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
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
          <h1 className="text-xl font-bold text-text">Editar Especialista</h1>
          <p className="text-text-muted text-sm">
            Modifique los datos del especialista seleccionado
          </p>
        </div>
      </div>

      {/* Banner informativo */}
      <div className="flex items-center gap-2.5 bg-warning/10 border border-warning/25 rounded-xl px-4 py-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-warning flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-warning text-xs font-medium">
          Editando: <strong>{form.nombres}</strong> · DNI {form.dni}
        </p>
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
            <div className="sm:col-span-2">
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Nombres y Apellidos <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => set('nombres', e.target.value)}
                className={inputClass}
              />
              {errors.nombres && <p className="text-danger text-xs mt-1">{errors.nombres}</p>}
            </div>

            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                DNI <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.dni}
                onChange={(e) => set('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                maxLength={8}
                className={`${inputClass} font-mono`}
              />
              {errors.dni && <p className="text-danger text-xs mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Núm. Celular <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.celular}
                onChange={(e) => set('celular', e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
                className={`${inputClass} font-mono`}
              />
              {errors.celular && <p className="text-danger text-xs mt-1">{errors.celular}</p>}
            </div>

            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Correo Electrónico <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => set('correo', e.target.value)}
                className={inputClass}
              />
              {errors.correo && <p className="text-danger text-xs mt-1">{errors.correo}</p>}
            </div>

            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Especialidad <span className="text-danger">*</span>
              </label>
              <input
                type="text"
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
            onClick={handleBack}
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
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};