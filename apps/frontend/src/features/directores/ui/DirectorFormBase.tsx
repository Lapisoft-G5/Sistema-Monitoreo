import { useState } from 'react';
import { User, Briefcase, Check } from 'lucide-react';
import { CONDICION_DIRECTIVA, ESCALAS_MAGISTERIALES } from '@entities/model-docentes';
import type { DirectorFormData } from '@entities/model-docentes/validator';
import { directorSchema } from '@entities/model-docentes/validator';
import { SectionCard, TextField, SelectField, FormButton, twoCols } from '@shared/ui/form-controls';

const INITIAL: DirectorFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  condicion: 'Designado',
  escala: 'I',
  institucionId: '',
  nivelEducativo: 'PRIMARIA',
  especialidad: '',
};

interface Props {
  onCancel: () => void;
  onSubmit: (data: DirectorFormData) => void;
  isLoading: boolean;
  initialData?: DirectorFormData;
  // IEs disponibles para asignar
  instituciones: { id: string; nombre: string; nivel?: string }[];
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
  const [form, setForm] = useState<DirectorFormData>(() => ({
    ...INITIAL,
    ...initialData,
  }));
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof DirectorFormData>(key: K, value: DirectorFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleInstitucionChange = (id: string) => {
    set('institucionId', id);
    const selectedIe = instituciones.find((i) => i.id === id);
    if (selectedIe && selectedIe.nivel) {
      set('nivelEducativo', selectedIe.nivel.toUpperCase() as "SECUNDARIA" | "INICIAL" | "PRIMARIA");
    }
  };

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
              dniOk ? (
                <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} />
              ) : undefined
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
              celularOk ? (
                <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} />
              ) : undefined
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
            options={[{ value: 'Director', label: 'Director de I.E.' }]}
            placeholder="Director de I.E."
            disabled
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
        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Institución Educativa"
            required
            value={form.institucionId}
            onChange={handleInstitucionChange}
            options={instituciones.map((i) => ({ value: i.id, label: i.nombre }))}
            placeholder="Seleccione la I.E."
            error={showError('institucionId')}
          />
          <SelectField
            label="Nivel Educativo"
            required
            value={form.nivelEducativo}
            onChange={(v) => set('nivelEducativo', v as "SECUNDARIA" | "INICIAL" | "PRIMARIA")}
            options={[
              { value: 'INICIAL', label: 'Inicial' },
              { value: 'PRIMARIA', label: 'Primaria' },
              { value: 'SECUNDARIA', label: 'Secundaria' },
            ]}
            placeholder="Seleccione Nivel"
            error={showError('nivelEducativo')}
            disabled
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <TextField
            label="Especialidad / Mención"
            required
            value={form.especialidad}
            onChange={(v) => set('especialidad', v)}
            placeholder="Ej. Matemática, Gestión Pedagógica"
            error={showError('especialidad')}
          />
          <SelectField
            label="Escala Magisterial"
            required
            value={form.escala}
            onChange={(v) => set('escala', v as "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII")}
            options={ESCALAS_MAGISTERIALES}
            placeholder="Seleccione Escala"
            error={showError('escala')}
          />
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
    </div>
  );
};
