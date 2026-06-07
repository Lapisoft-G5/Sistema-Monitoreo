import { useState } from 'react';
import { User, Briefcase, Check } from 'lucide-react';
import { NIVELES_INSTITUCION, ROL_ESPECIALISTA_LABELS, type NivelInstitucion, type EspecialistaRol } from '@entities/model-especialistas';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';
import { especialistaSchema } from '@entities/model-especialistas/validator';
import { FormButton, SectionCard, SelectField, TextField, twoCols } from '@shared/ui/form-controls';
import { Label } from '@shared/ui/label';

interface Props {
  onCancel: () => void;
  onSubmit: (data: EspecialistaFormData) => void;
  isLoading: boolean;
  initialData?: EspecialistaFormData;
}

const INITIAL_FORM: EspecialistaFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  especialidad: '',
  rol: 'especialista_bajo',
  niveles: ['Primaria'],
  activo: true,
};

export const EspecialistaFormBase = ({
  onCancel,
  onSubmit,
  isLoading,
  initialData,
}: Props) => {
  const [form, setForm] = useState<EspecialistaFormData>(initialData || INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

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

  const showError = (key: keyof EspecialistaFormData) => (submitted ? errors[key] : '');

  const toggleNivel = (nivel: NivelInstitucion) => {
    const current = form.niveles || [];
    if (current.includes(nivel)) {
      set('niveles', current.filter((n) => n !== nivel));
    } else {
      set('niveles', [...current, nivel]);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validationResult.success || isLoading) return;
    onSubmit(form);
  };

  const dniOk = /^\d{8}$/.test(form.dni);
  const celularOk = /^9\d{8}$/.test(form.celular);

  return (
    <div className="bg-bg p-0 flex flex-col gap-5 text-text animate-in fade-in-0 duration-300">
      {/* Sección 1: Datos Personales */}
      <SectionCard icon={<User className="w-5 h-5" />} title="Información Personal">
        <div style={twoCols}>
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
          <div className="flex gap-4">
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

      {/* Sección 2: Perfil y Niveles */}
      <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Detalles Profesionales">
        <div style={twoCols}>
          <SelectField
            label="Rol de Especialista"
            required
            value={form.rol}
            onChange={(v) => set('rol', v as EspecialistaRol)}
            options={Object.entries(ROL_ESPECIALISTA_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
            placeholder="Seleccione Rol"
            error={showError('rol')}
          />
          <TextField
            label="Especialidad / Área Pedagógica"
            required
            value={form.especialidad}
            onChange={(v) => set('especialidad', v)}
            placeholder="Ej. Matemática o Gestión Pedagógica"
            error={showError('especialidad')}
          />
        </div>

        <div className="flex flex-col gap-2 mt-5">
          <Label className="text-xs font-bold text-text">Niveles Educativos Asignados *</Label>
          <div className="flex flex-wrap gap-2.5 mt-1">
            {NIVELES_INSTITUCION.map((nivel) => {
              const isSelected = (form.niveles || []).includes(nivel);
              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => toggleNivel(nivel)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer
                    ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary shadow-xs'
                        : 'bg-surface border-border text-text-muted hover:border-text-dim hover:text-text'
                    }
                  `}
                >
                  {nivel}
                </button>
              );
            })}
          </div>
          {showError('niveles') && (
            <p className="text-red-500 text-xs mt-1 font-medium">{showError('niveles')}</p>
          )}
        </div>
      </SectionCard>

      {/* Botones de Envío */}
      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </FormButton>
        <FormButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Especialista'}
        </FormButton>
      </div>
    </div>
  );
};
