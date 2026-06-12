import { useState } from 'react';
import { User, Briefcase, Check } from 'lucide-react';
import type { JefeAreaFormData } from '@entities/model-jefes-area/validator';
import { jefeAreaSchema } from '@entities/model-jefes-area/validator';
import { FormButton, SectionCard, SelectField, TextField, twoCols } from '@shared/ui/form-controls';

interface Props {
  onCancel: () => void;
  onSubmit: (data: JefeAreaFormData) => void;
  isLoading: boolean;
  initialData?: JefeAreaFormData;
}

const INITIAL_FORM: JefeAreaFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  cargaHoraria: 40,
  nivelEducativo: 'SECUNDARIA',
  activo: true,
};

export const JefeAreaFormBase = ({
  onCancel,
  onSubmit,
  isLoading,
  initialData,
}: Props) => {
  const [form, setForm] = useState<JefeAreaFormData>({
    ...INITIAL_FORM,
    ...initialData,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof JefeAreaFormData>(key: K, value: JefeAreaFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validationResult = jefeAreaSchema.safeParse(form);
  const errors: Record<string, string> = {};

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }

  const showError = (key: keyof JefeAreaFormData) => (submitted ? errors[key] : '');

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || isLoading) return;
    onSubmit(form);
  };

  const dniOk = /^\d{8}$/.test(form.dni);
  const celularOk = /^9\d{8}$/.test(form.celular);

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
            required
            value={form.correo}
            onChange={(v) => set('correo', v)}
            placeholder="Ej. jperez@ugel-lampa.gob.pe"
            error={showError('correo')}
          />
          <TextField
            label="Número de Celular"
            required
            value={form.celular}
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

      {/* Sección 2: Detalle del Puesto */}
      <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Detalles del Puesto">
        <div style={twoCols}>
          <SelectField
            label="Nivel Educativo a Cargo"
            required
            value={form.nivelEducativo}
            onChange={(v) => set('nivelEducativo', v as 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA')}
            options={[
              { value: 'INICIAL', label: 'Inicial' },
              { value: 'PRIMARIA', label: 'Primaria' },
              { value: 'SECUNDARIA', label: 'Secundaria' },
            ]}
            placeholder="Seleccione Nivel"
            error={showError('nivelEducativo')}
          />
          <TextField
            label="Carga Horaria (Horas)"
            required
            value={form.cargaHoraria?.toString() || ''}
            onChange={(v) => set('cargaHoraria', v ? Number(v.replace(/\D/g, '')) : 40)}
            placeholder="Ej. 40"
            error={showError('cargaHoraria')}
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
