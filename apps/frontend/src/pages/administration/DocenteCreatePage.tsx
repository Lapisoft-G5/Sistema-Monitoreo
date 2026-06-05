import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/authentication/useAuth';
import type {
  CondicionLaboral,
  EscalaMagisterial,
  SeccionDocente,
} from '../../entities/teacher/teacher.types';
import { CONDICION_LABORAL, ESCALAS_MAGISTERIALES } from '../../entities/teacher/teacher.types';
import type { NivelInstitucion } from '../../entities/specialist/specialist.types';

const NIVELES_POR_INSTITUCION: Record<string, NivelInstitucion[]> = {
  '1': ['Primaria'],
  '2': ['Secundaria'],
  '3': ['Inicial', 'Primaria'],
};

interface FormData {
  nombres: string;
  dni: string;
  correo: string;
  celular: string;
  nivel: NivelInstitucion | '';
  condicion: CondicionLaboral | '';
  especialidad: string;
  cargaHoraria: string;
  secciones: SeccionDocente[];
  escala: EscalaMagisterial | '';
  cargo?: string;
}

const EMPTY: FormData = {
  nombres: '',
  dni: '',
  correo: '',
  celular: '',
  nivel: '',
  condicion: '',
  especialidad: '',
  cargaHoraria: '',
  secciones: [],
  escala: '',
  cargo: 'Director',
};

const inputClass = `
  w-full bg-bg border border-border rounded-xl outline-none text-text text-sm
  px-3 py-2.5 placeholder:text-text-dim
  focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all
`;

const selectClass = `
  w-full bg-bg border border-border rounded-xl outline-none text-text text-sm
  px-3 py-2.5 cursor-pointer
  focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all
`;

let seccionCounter = 100;
const newSeccionId = () => `new-${++seccionCounter}`;

export const DocenteCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isJefeArea = user?.role === 'jefe_area';

  const [form, setForm] = useState<FormData>({
    ...EMPTY,
    cargo: isJefeArea ? 'Director' : 'Docente de Aula',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'secciones_items', string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const nivelesDisponibles: NivelInstitucion[] = isJefeArea
    ? ['Inicial', 'Primaria', 'Secundaria']
    : (NIVELES_POR_INSTITUCION[user?.id ?? ''] ?? ['Primaria']);

  const set = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const addSeccion = () =>
    setForm((p) => ({ ...p, secciones: [...p.secciones, { id: newSeccionId(), grado: '' }] }));

  const updateSeccion = (id: string, grado: string) =>
    setForm((p) => ({
      ...p,
      secciones: p.secciones.map((s) => (s.id === id ? { ...s, grado } : s)),
    }));

  const removeSeccion = (id: string) =>
    setForm((p) => ({ ...p, secciones: p.secciones.filter((s) => s.id !== id) }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData | 'secciones_items', string>> = {};
    if (!form.nombres.trim()) e.nombres = 'El nombre es requerido';
    if (!/^\d{8}$/.test(form.dni)) e.dni = 'El DNI debe tener 8 dígitos';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido';
    if (!/^\d{9}$/.test(form.celular)) e.celular = 'El celular debe tener 9 dígitos';
    if (!form.nivel) e.nivel = 'Seleccione un nivel';
    if (!form.condicion) e.condicion = 'Seleccione una condición';
    if (!form.especialidad.trim()) e.especialidad = 'La especialidad es requerida';
    if (!form.cargaHoraria || isNaN(Number(form.cargaHoraria)) || Number(form.cargaHoraria) <= 0)
      e.cargaHoraria = 'Ingrese una carga horaria válida';
    if (!isJefeArea) {
      if (form.secciones.length === 0) e.secciones = 'Agregue al menos una sección';
      if (form.secciones.some((s) => !s.grado.trim()))
        e.secciones_items = 'Complete todos los campos de sección';
    }
    if (!form.escala) e.escala = 'Seleccione una escala';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate('/instituciones/docentes');
  };

  return (
    <div className="p-6 max-w-[820px] mx-auto flex flex-col gap-5">
      {/* ── Encabezado ── */}
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
          <h1 className="text-xl font-bold text-text">
            {isJefeArea ? 'Nuevo Directivo' : 'Nuevo Docente'}
          </h1>
          <p className="text-text-muted text-sm">
            {isJefeArea
              ? 'Complete los datos para registrar un nuevo director o coordinador'
              : 'Complete los datos para registrar un nuevo docente'}
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
              <p className="text-text-dim text-xs">
                {isJefeArea ? 'Datos de identificación del directivo' : 'Datos de identificación del docente'}
              </p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Nombres y Apellidos <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder={isJefeArea ? "Ej: Rosa Elena Mamani Ccopa" : "Ej: Juan Carlos Pérez Gómez"}
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
                placeholder="12345678"
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
                placeholder="951234567"
                value={form.celular}
                onChange={(e) => set('celular', e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
                className={`${inputClass} font-mono`}
              />
              {errors.celular && <p className="text-danger text-xs mt-1">{errors.celular}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Correo Electrónico <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder={isJefeArea ? "director@ugel.edu.pe" : "ejemplo@ie.edu.pe"}
                value={form.correo}
                onChange={(e) => set('correo', e.target.value)}
                className={inputClass}
              />
              {errors.correo && <p className="text-danger text-xs mt-1">{errors.correo}</p>}
            </div>
          </div>
        </div>

        {/* ── Bloque 2: Detalles Laborales ── */}
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
              <p className="text-text-dim text-xs">
                {isJefeArea ? 'Información sobre la función del directivo' : 'Información sobre la función del docente'}
              </p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isJefeArea && (
              <div>
                <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                  Cargo <span className="text-danger">*</span>
                </label>
                <select
                  value={form.cargo}
                  onChange={(e) => set('cargo', e.target.value)}
                  className={selectClass}
                >
                  <option value="Director">Director</option>
                  <option value="Coordinador Pedagógico">Coordinador Pedagógico</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Nivel Educativo <span className="text-danger">*</span>
              </label>
              <select
                value={form.nivel}
                onChange={(e) => set('nivel', e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccione un nivel</option>
                {nivelesDisponibles.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.nivel && <p className="text-danger text-xs mt-1">{errors.nivel}</p>}
            </div>
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Condición Laboral <span className="text-danger">*</span>
              </label>
              <select
                value={form.condicion}
                onChange={(e) => set('condicion', e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccione condición</option>
                {CONDICION_LABORAL.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.condicion && <p className="text-danger text-xs mt-1">{errors.condicion}</p>}
            </div>
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Especialidad Principal <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder={isJefeArea ? "Ej: Gestión Pública / Pedagogía" : "Ej: Comunicación Integral"}
                value={form.especialidad}
                onChange={(e) => set('especialidad', e.target.value)}
                className={inputClass}
              />
              {errors.especialidad && (
                <p className="text-danger text-xs mt-1">{errors.especialidad}</p>
              )}
            </div>
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Carga Horaria <span className="text-danger">*</span>
                <span className="text-text-dim font-normal normal-case ml-1">(horas/semana)</span>
              </label>
              <input
                type="number"
                placeholder={isJefeArea ? "Ej: 40" : "Ej: 30"}
                min={1}
                max={60}
                value={form.cargaHoraria}
                onChange={(e) => set('cargaHoraria', e.target.value)}
                className={inputClass}
              />
              {errors.cargaHoraria && (
                <p className="text-danger text-xs mt-1">{errors.cargaHoraria}</p>
              )}
            </div>
            <div>
              <label className="block text-text-muted text-[0.68rem] font-bold tracking-wider uppercase mb-1.5">
                Escala Magisterial <span className="text-danger">*</span>
              </label>
              <select
                value={form.escala}
                onChange={(e) => set('escala', e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccione una escala</option>
                {ESCALAS_MAGISTERIALES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
              {errors.escala && <p className="text-danger text-xs mt-1">{errors.escala}</p>}
            </div>

            {/* Secciones */}
            {!isJefeArea && (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-muted text-[0.68rem] font-bold tracking-wider uppercase">
                    Grado / Secciones a cargo <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSeccion}
                    className="flex items-center gap-1.5 text-primary hover:text-primary-hover text-xs font-semibold bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Agregar sección
                  </button>
                </div>
                {form.secciones.length === 0 ? (
                  <div
                    onClick={addSeccion}
                    className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all gap-2"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-text-dim"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <p className="text-text-dim text-xs">Haga clic para agregar una sección</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {form.secciones.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-text-dim text-xs w-5 text-right flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          placeholder="Ej: 4to A"
                          value={s.grado}
                          onChange={(e) => updateSeccion(s.id, e.target.value)}
                          className="flex-1 bg-bg border border-border rounded-xl outline-none text-text text-sm px-3 py-2 placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeSeccion(s.id)}
                          className="p-2 rounded-lg text-text-dim hover:text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none flex-shrink-0"
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
                      </div>
                    ))}
                  </div>
                )}
                {errors.secciones && <p className="text-danger text-xs mt-2">{errors.secciones}</p>}
                {errors.secciones_items && (
                  <p className="text-danger text-xs mt-1">{errors.secciones_items}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
                {isJefeArea ? 'Guardar Directivo' : 'Guardar Docente'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
