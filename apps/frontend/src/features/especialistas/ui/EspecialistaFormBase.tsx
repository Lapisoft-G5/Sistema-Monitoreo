import { useState, useRef } from 'react';
import { User, Briefcase, Check, Plus, X } from 'lucide-react';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';
import { especialistaSchema } from '@entities/model-especialistas/validator';
import { FormButton, SectionCard, SelectField, TextField, twoCols } from '@shared/ui/form-controls';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';

interface Props {
  onCancel: () => void;
  onSubmit: (data: EspecialistaFormData) => void;
  isLoading: boolean;
  initialData?: EspecialistaFormData;
  isJefeArea?: boolean;
}

const INITIAL_FORM: EspecialistaFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  especialidades: [],
  nivelEducativo: 'Primaria',
  modalidad: 'EBR',
  cargo: 'Especialista',
  activo: true,
  condicionLaboral: 'Encargado',
  cargaLaboral: 40,
  escalaMagisterial: undefined,
};

export const EspecialistaFormBase = ({
  onCancel,
  onSubmit,
  isLoading,
  initialData,
  isJefeArea = false,
}: Props) => {
  // Ajuste de inicialización en base a si esJefeArea es verdadero
  const defaultForm = {
    ...INITIAL_FORM,
    cargo: isJefeArea ? ('Jefe de Área' as const) : ('Especialista' as const),
    condicionLaboral: isJefeArea ? ('Designado' as const) : ('Encargado' as const),
  };

  const [form, setForm] = useState<EspecialistaFormData>({
    ...defaultForm,
    ...initialData,
  });
  const [submitted, setSubmitted] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState('');
  const newEspRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EspecialistaFormData>(key: K, value: EspecialistaFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validationResult = especialistaSchema.safeParse(form);
  const errors: Record<string, string> = {};

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }

  // Validación personalizada: especialidad requerida en Secundaria (al menos 1)
  const isSecundaria = form.nivelEducativo === 'Secundaria';
  const especialidades = form.especialidades || [];
  if (form.cargo === 'Especialista' || form.cargo === 'Jefe de Área') {
    if (isSecundaria && especialidades.length === 0) {
      errors.especialidades = 'Al menos una especialidad es requerida para el nivel Secundaria';
    }
  }

  const addEspecialidad = () => {
    const val = newEspecialidad.trim();
    if (!val) return;
    if (especialidades.includes(val)) return;
    set('especialidades', [...especialidades, val]);
    setNewEspecialidad('');
    newEspRef.current?.focus();
  };

  const removeEspecialidad = (esp: string) => {
    set('especialidades', especialidades.filter((e) => e !== esp));
  };

  const showError = (key: keyof EspecialistaFormData) => (submitted ? errors[key] : '');

  const dniOk = /^\d{8}$/.test(form.dni);
  const celularOk = form.celular ? /^9\d{8}$/.test(form.celular) : false;

  const currentModalidad = form.modalidad || 'EBR';
  const availableNiveles = MODALIDAD_NIVEL_MAP[currentModalidad] || [];

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || isLoading) return;
    onSubmit(form);
  };

  return (
    <div className="bg-bg p-0 flex flex-col gap-5 text-text animate-in fade-in-0 duration-300">
      {/* Sección 1: Datos Personales */}
      <SectionCard icon={<User className="w-5 h-5" />} title="Información Personal">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-[18px]">
          <div className="md:col-span-1">
            <TextField
              label="DNI (8 dígitos)"
              required
              value={form.dni}
              onChange={(v) => set('dni', v.replace(/\D/g, '').slice(0, 8))}
              placeholder="Ej. 74859612"
              error={showError('dni')}
              adornment={
                dniOk ? (
                  <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} />
                ) : undefined
              }
            />
          </div>
          <div className="md:col-span-2">
            <TextField
              label="Nombres"
              required
              value={form.nombres}
              onChange={(v) => set('nombres', v)}
              placeholder="Ej. Juan Carlos"
              error={showError('nombres')}
            />
          </div>
          <div className="md:col-span-2">
            <TextField
              label="Apellidos"
              required
              value={form.apellidos}
              onChange={(v) => set('apellidos', v)}
              placeholder="Ej. Pérez López"
              error={showError('apellidos')}
            />
          </div>
        </div>

        <div style={{ ...twoCols, marginTop: 18 }}>
          <TextField
            label="Correo Electrónico"
            value={form.correo || ''}
            onChange={(v) => set('correo', v)}
            placeholder="Ej. jperez@ugel-lampa.gob.pe"
            error={showError('correo')}
          />
          <TextField
            label="Número de Celular"
            value={form.celular || ''}
            onChange={(v) => set('celular', v.replace(/\D/g, '').slice(0, 9))}
            placeholder="Ej. 987654321"
            error={showError('celular')}
            adornment={
              celularOk ? (
                <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} />
              ) : undefined
            }
          />
        </div>
      </SectionCard>

      {/*/ Sección 2: Perfil y Niveles */}
      <SectionCard
        icon={<Briefcase className="w-5 h-5" />}
        title="Detalles Profesionales / Laborales"
      >
        <div style={twoCols}>
          <SelectField
            label="Cargo *"
            required
            value={form.cargo}
            onChange={(v) => set('cargo', v as "Jefe de Área" | "Jefe de Gestión" | "Especialista")}
            options={[
              { value: 'Especialista', label: 'Especialista' },
              { value: 'Jefe de Área', label: 'Jefe de Área' },
              { value: 'Jefe de Gestión', label: 'Jefe de Gestión' },
            ]}
            disabled={true}
            placeholder="Seleccione Cargo"
            error={showError('cargo')}
          />
          <SelectField
            label="Condición Laboral *"
            required
            value={form.condicionLaboral}
            onChange={(v) => set('condicionLaboral', v as "Destacado" | "Designado" | "Encargado")}
            options={[
              { value: 'Encargado', label: 'Encargado' },
              { value: 'Destacado', label: 'Destacado' },
              { value: 'Designado', label: 'Designado' },
            ]}
            placeholder="Seleccione Condición"
            error={showError('condicionLaboral')}
          />
        </div>

        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Modalidad *"
            required
            value={form.modalidad}
            onChange={(v) => {
              const levels = MODALIDAD_NIVEL_MAP[v] || [];
              setForm((prev) => ({
                ...prev,
                modalidad: v as "EBR" | "EBA" | "EBE" | "CEPTRO",
                nivelEducativo: levels[0] || '',
                especialidades: [],
              }));
            }}
            options={[
              { value: 'EBR', label: 'EBR (Básica Regular)' },
              { value: 'EBA', label: 'EBA (Básica Alternativa)' },
              { value: 'EBE', label: 'EBE (Básica Especial)' },
              { value: 'CEPTRO', label: 'CEPTRO (Técnico Productiva)' },
            ]}
            placeholder="Seleccione Modalidad"
            error={showError('modalidad')}
          />
          <SelectField
            label="Nivel Educativo *"
            required
            value={form.nivelEducativo}
            onChange={(v) => {
              setForm((prev) => ({
                ...prev,
                nivelEducativo: v,
                especialidades: v !== 'Secundaria' ? [] : prev.especialidades,
              }));
            }}
            options={availableNiveles.map((n) => ({ value: n, label: n }))}
            placeholder="Seleccione Nivel"
            error={showError('nivelEducativo')}
          />
        </div>

        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Escala Magisterial"
            value={form.escalaMagisterial?.toString() || 'none'}
            onChange={(v) => set('escalaMagisterial', v === 'none' ? undefined : Number(v))}
            options={[
              { value: 'none', label: 'Ninguna / No aplica' },
              { value: '1', label: 'Escala I' },
              { value: '2', label: 'Escala II' },
              { value: '3', label: 'Escala III' },
              { value: '4', label: 'Escala IV' },
              { value: '5', label: 'Escala V' },
              { value: '6', label: 'Escala VI' },
              { value: '7', label: 'Escala VII' },
              { value: '8', label: 'Escala VIII' },
            ]}
            placeholder="Seleccione Escala Magisterial"
            error={showError('escalaMagisterial')}
          />
          {/* Especialidades (multi-tag) — solo visible en Secundaria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Especialidades / Áreas Pedagógicas
              {isSecundaria && <span className="text-red-500 ml-0.5">*</span>}
              {!isSecundaria && <span className="ml-1 text-text-muted font-normal normal-case">(solo Secundaria)</span>}
            </label>
            {/* Tags actuales */}
            {especialidades.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {especialidades.map((esp) => (
                  <span
                    key={esp}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {esp}
                    {isSecundaria && (
                      <button
                        type="button"
                        onClick={() => removeEspecialidad(esp)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {/* Input para agregar */}
            {isSecundaria && (
              <div className="flex gap-2">
                <input
                  ref={newEspRef}
                  type="text"
                  value={newEspecialidad}
                  onChange={(e) => setNewEspecialidad(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addEspecialidad(); }
                  }}
                  placeholder="Ej. Matemática, CTA, Historia..."
                  className="flex-1 text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={addEspecialidad}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>
            )}
            {submitted && errors.especialidades && (
              <p className="text-xs text-red-500 mt-0.5">{errors.especialidades}</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <TextField
            label="Carga Laboral (Horas) *"
            required
            value={form.cargaLaboral?.toString() || ''}
            onChange={(v) => set('cargaLaboral', v ? Number(v.replace(/\D/g, '')) : 40)}
            placeholder="Ej. 40"
            error={showError('cargaLaboral')}
          />
        </div>
      </SectionCard>

      {/* Botones de Envío */}
      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </FormButton>
        <FormButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Datos'}
        </FormButton>
      </div>
    </div>
  );
};
