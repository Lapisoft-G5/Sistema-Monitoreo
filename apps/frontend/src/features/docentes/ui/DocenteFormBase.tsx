import { useState } from 'react';
import { User, Briefcase, Plus, Trash2, Check, GraduationCap } from 'lucide-react';
import { CONDICION_LABORAL, ESCALAS_MAGISTERIALES } from '@entities/model-docentes';
import { NIVELES, NIVEL_LABEL, MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import type { DocenteFormData } from '@entities/model-docentes/validator';
import { docenteSchema } from '@entities/model-docentes/validator';
import { FormButton, SectionCard, SelectField, TextField, twoCols } from '@shared/ui/form-controls';
import { Button } from '@shared/ui/button';
import { useUser } from '@entities/model-user';

interface Props {
  onCancel: () => void;
  onSubmit: (data: DocenteFormData) => void;
  isLoading: boolean;
  initialData?: DocenteFormData;
  instituciones: { id: string; nombre: string }[];
  defaultCargo?: 'Director' | 'Coordinador Pedagógico' | 'Docente de Aula';
  submitLabel?: string;
}

const INITIAL_FORM: DocenteFormData = {
  nombres: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  nivelEducativo: 'PRIMARIA',
  condicion: 'Nombrado',
  especialidad: '',
  cargaHoraria: 30,
  secciones: [],
  escala: 'I',
  institucionId: '',
  activo: true,
  cargo: 'Director',
};

export const DocenteFormBase = ({
  onCancel,
  onSubmit,
  isLoading,
  initialData,
  instituciones,
  defaultCargo = 'Director',
  submitLabel,
}: Props) => {
  const { user } = useUser();
  const isDirectorIe = user?.role === 'director_institucion' || user?.role === 'director_ie';

  const [form, setForm] = useState<DocenteFormData>(() => {
    if (initialData) return initialData;
    
    let initialInstId = '';
    let initialNivel: DocenteFormData['nivelEducativo'] = 'PRIMARIA';
    
    if (isDirectorIe && user?.institucion) {
      const userInst = instituciones.find((i) => i.nombre === user.institucion);
      initialInstId = userInst?.id ?? '1';
      
      const fullInst = MOCK_INSTITUCIONES.find((i) => i.nombre === user.institucion);
      if (fullInst) {
        initialNivel = fullInst.nivel;
      }
    }

    return {
      ...INITIAL_FORM,
      cargo: defaultCargo,
      institucionId: initialInstId,
      nivelEducativo: initialNivel,
    };
  });
  const [submitted, setSubmitted] = useState(false);
  const [newGrado, setNewGrado] = useState('');

  const set = <K extends keyof DocenteFormData>(key: K, value: DocenteFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Validación rápida con Zod para mostrar errores en tiempo real
  const validationResult = docenteSchema.safeParse(form);
  const errors: Record<string, string> = {};

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }

  const showError = (key: keyof DocenteFormData) => (submitted ? errors[key] : '');

  const handleAddSeccion = () => {
    if (!newGrado.trim()) return;
    const currentSecciones = form.secciones || [];
    set('secciones', [
      ...currentSecciones,
      { id: globalThis.crypto?.randomUUID?.() ?? String(Math.random()), grado: newGrado.trim() },
    ]);
    setNewGrado('');
  };

  const handleRemoveSeccion = (id?: string) => {
    if (!id) return;
    const currentSecciones = form.secciones || [];
    set(
      'secciones',
      currentSecciones.filter((s) => s.id !== id),
    );
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4.5">
          <div className="md:col-span-1 min-w-[140px]">
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
              placeholder="Ej. Rosa Elena"
              error={showError('nombres')}
            />
          </div>
          <div className="md:col-span-2">
            <TextField
              label="Apellidos"
              required
              value={form.apellidos}
              onChange={(v) => set('apellidos', v)}
              placeholder="Ej. Mamani Ccopa"
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
            placeholder="Ej. director@ie.edu.pe"
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

      {/* Sección 2: Datos Laborales */}
      <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Detalles Laborales">
        <div style={{ maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          {isDirectorIe ? (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-text-muted">Institución de Destino (I.E.)</label>
              <div className="flex items-center h-9 px-3 rounded-lg border border-border bg-muted/30 text-text font-medium text-sm">
                {instituciones.find((i) => i.id === form.institucionId)?.nombre || 'I.E. No Asignada'}
              </div>
            </div>
          ) : (
            <SelectField
              label="Institución de Destino (I.E.)"
              required
              value={form.institucionId}
              onChange={(v) => set('institucionId', v)}
              options={instituciones.map((i) => ({ value: i.id, label: i.nombre }))}
              placeholder="Seleccione I.E."
              error={showError('institucionId')}
            />
          )}
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Condición Laboral"
            required
            value={form.condicion}
            onChange={(v) => set('condicion', v as DocenteFormData['condicion'])}
            options={CONDICION_LABORAL.map((c) => ({ value: c, label: c }))}
            placeholder="Seleccione Condición"
            error={showError('condicion')}
          />
          <SelectField
            label="Escala Magisterial"
            required
            value={form.escala}
            onChange={(v) => set('escala', v as DocenteFormData['escala'])}
            options={ESCALAS_MAGISTERIALES}
            placeholder="Seleccione Escala"
            error={showError('escala')}
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          {isDirectorIe ? (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-text-muted">Nivel Educativo</label>
              <div className="flex items-center h-9 px-3 rounded-lg border border-border bg-muted/30 text-text font-medium text-sm">
                {NIVEL_LABEL[form.nivelEducativo]}
              </div>
            </div>
          ) : (
            <SelectField
              label="Nivel Educativo"
              required
              value={form.nivelEducativo}
              onChange={(v) => set('nivelEducativo', v as DocenteFormData['nivelEducativo'])}
              options={NIVELES.map((n) => ({ value: n, label: NIVEL_LABEL[n] }))}
              placeholder="Seleccione Nivel"
              error={showError('nivelEducativo')}
            />
          )}
          <TextField
            label="Especialidad / Mención"
            required
            value={form.especialidad}
            onChange={(v) => set('especialidad', v)}
            placeholder="Ej. Matemática y Física"
            error={showError('especialidad')}
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <TextField
            label="Carga Horaria Semanal (Horas)"
            required
            value={String(form.cargaHoraria)}
            onChange={(v) => set('cargaHoraria', Number(v.replace(/\D/g, '')))}
            placeholder="Ej. 30"
            error={showError('cargaHoraria')}
          />
        </div>
      </SectionCard>

      {/* Sección 3: Secciones y Grados (Relevante para Docentes de Aula) */}
      {form.cargo !== 'Director' && (
        <SectionCard
          icon={<GraduationCap className="w-5 h-5" />}
          title="Grados y Secciones Asignadas"
        >
          <div className="flex gap-3 items-end max-w-md mb-4">
            <TextField
              label="Agregar Grado / Sección"
              value={newGrado}
              onChange={setNewGrado}
              placeholder="Ej. 5to A, 6to B"
            />
            <Button
              type="button"
              onClick={handleAddSeccion}
              className="flex items-center gap-1.5 h-9 font-semibold bg-primary text-white hover:bg-primary-hover px-4 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(form.secciones || []).map((sec) => (
              <div
                key={sec.id}
                className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-xl text-sm font-medium text-text"
              >
                <span>{sec.grado}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSeccion(sec.id)}
                  className="text-text-muted hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(form.secciones || []).length === 0 && (
              <span className="text-xs text-text-muted italic">
                No se han asignado grados ni secciones aún.
              </span>
            )}
          </div>
        </SectionCard>
      )}

      {/* Botones de Envío */}
      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </FormButton>
        <FormButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : (submitLabel || 'Guardar Director/Docente')}
        </FormButton>
      </div>
    </div>
  );
};
