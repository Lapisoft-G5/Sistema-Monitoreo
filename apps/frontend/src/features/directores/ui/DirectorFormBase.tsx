import { useState, type ReactNode } from 'react';
import { User, Briefcase, Check, BadgeCheck, ShieldCheck, History } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { CONDICION_DIRECTIVA } from '@entities/model-docentes';
import type { DirectorFormData } from '@entities/model-docentes/validator';
import { directorSchema } from '@entities/model-docentes/validator';
import { SectionCard, TextField, SelectField, FormButton, twoCols } from '@shared/ui/form-controls';

// Escala magisterial: se muestra 1-8, se guarda en romano (I-VIII).
const ESCALAS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

const INITIAL: DirectorFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  condicion: 'Asignado',
  escala: 'I',
  institucionId: '',
};

interface Props {
  onCancel: () => void;
  onSubmit: (data: DirectorFormData) => void;
  isLoading: boolean;
  initialData?: DirectorFormData;
  // IEs disponibles para asignar (al registrar: solo las que no tienen director).
  instituciones: { id: string; nombre: string }[];
  submitLabel?: string;
}

export const DirectorFormBase = ({
  onCancel,
  onSubmit,
  isLoading,
  initialData,
  instituciones,
  submitLabel,
}: Props) => {
  const [form, setForm] = useState<DirectorFormData>(initialData ?? INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof DirectorFormData>(key: K, value: DirectorFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const result = directorSchema.safeParse(form);
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      if (!errors[path]) errors[path] = issue.message;
    });
  }
  const showError = (key: keyof DirectorFormData) => (submitted ? errors[key] : '');

  const handleSubmit = () => {
    setSubmitted(true);
    if (!result.success || isLoading) return;
    onSubmit(form);
  };

  const dniOk = /^\d{8}$/.test(form.dni);
  const celularOk = /^9\d{8}$/.test(form.celular);

  return (
    <div className="bg-bg p-0 flex flex-col gap-5 text-text animate-in fade-in-0 duration-300">
      {/* Información Personal */}
      <SectionCard icon={<User className="w-5 h-5" />} title="Información Personal">
        <div style={twoCols}>
          <TextField
            label="Nombres"
            required
            value={form.nombres}
            onChange={(v) => set('nombres', v)}
            placeholder="Ej. Juan Carlos"
            error={showError('nombres')}
          />
          <TextField
            label="Apellidos"
            required
            value={form.apellidos}
            onChange={(v) => set('apellidos', v)}
            placeholder="Ej. Pérez García"
            error={showError('apellidos')}
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <TextField
            label="DNI / Documento de Identidad"
            required
            value={form.dni}
            onChange={(v) => set('dni', v.replace(/\D/g, '').slice(0, 8))}
            placeholder="8 dígitos"
            error={showError('dni')}
            adornment={
              dniOk ? <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} /> : undefined
            }
          />
          <TextField
            label="Número de Celular"
            required
            value={form.celular}
            onChange={(v) => set('celular', v.replace(/\D/g, '').slice(0, 9))}
            placeholder="999 999 999"
            error={showError('celular')}
            adornment={
              celularOk ? <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} /> : undefined
            }
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <TextField
            label="Correo Electrónico Institucional"
            required
            value={form.correo}
            onChange={(v) => set('correo', v)}
            placeholder="usuario@ugel.gob.pe"
            error={showError('correo')}
          />
        </div>
      </SectionCard>

      {/* Detalles Laborales */}
      <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Detalles Laborales">
        <div style={twoCols}>
          <SelectField
            label="Cargo Institucional"
            required
            value="Director"
            onChange={() => undefined}
            options={[{ value: 'Director', label: 'Director de Institución Educativa' }]}
            placeholder="Director de Institución Educativa"
          />
          <SelectField
            label="Condición Laboral"
            required
            value={form.condicion}
            onChange={(v) => set('condicion', v as DirectorFormData['condicion'])}
            options={CONDICION_DIRECTIVA.map((c) => ({ value: c, label: c }))}
            placeholder="Seleccione condición"
            error={showError('condicion')}
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <SelectField
            label="Institución Educativa"
            required
            value={form.institucionId}
            onChange={(v) => set('institucionId', v)}
            options={instituciones.map((i) => ({ value: i.id, label: i.nombre }))}
            placeholder="Seleccione la I.E. (sin director)"
            error={showError('institucionId')}
          />
        </div>
        <div className="mt-[18px] flex flex-col gap-1">
          <label className="text-xs font-semibold text-text">
            Escala Magisterial (1 a 8) <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-2 flex-wrap mt-1">
            {ESCALAS_ROMAN.map((rom, i) => (
              <button
                key={rom}
                type="button"
                onClick={() => set('escala', rom)}
                className={cn(
                  'h-9 w-10 rounded-lg border text-sm font-bold transition-colors cursor-pointer',
                  form.escala === rom
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-muted hover:bg-muted',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Botones */}
      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </FormButton>
        <FormButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : submitLabel || 'Guardar Director'}
        </FormButton>
      </div>

      {/* Cards informativas (Validación / Seguridad / Trazabilidad) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<BadgeCheck className="w-4 h-4" />}
          title="Validación DNI"
          text="Conexión directa con RENIEC activa."
        />
        <InfoCard
          icon={<ShieldCheck className="w-4 h-4" />}
          title="Seguridad"
          text="Datos encriptados según ley 29733."
        />
        <InfoCard
          icon={<History className="w-4 h-4" />}
          title="Trazabilidad"
          text="Se registrará fecha y usuario autor."
        />
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, text }: { icon: ReactNode; title: string; text: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
    <span className="text-primary mt-0.5 flex-shrink-0">{icon}</span>
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-text-muted">{title}</div>
      <div className="text-xs text-text-muted mt-0.5">{text}</div>
    </div>
  </div>
);
