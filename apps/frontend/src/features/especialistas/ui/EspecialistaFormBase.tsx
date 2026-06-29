import { useState, useRef, useMemo, useCallback } from 'react';
import { User, Briefcase, Check, Plus, X } from 'lucide-react';
import { CARGA_HORARIA, VALIDATION } from '@shared/config/constants';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';
import { especialistaSchema } from '@entities/model-especialistas/validator';
import { FormButton, SectionCard, SelectField, TextField } from '@shared/ui/form-controls';
import { Spinner } from '@shared/ui/Spinner';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';
import { usePersonForm, extractErrors } from '@shared/hooks/usePersonForm';

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
  especialidad: '',
  especialidadesExtras: [],
  nivelEducativo: 'Primaria',
  modalidad: 'EBR',
  cargo: 'Especialista',
  activo: true,
  condicionLaboral: 'Encargado',
  cargaLaboral: CARGA_HORARIA.ESPECIALISTA,
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

  const [form, setForm] = useState<EspecialistaFormData>(() => {
    const base = {
      ...defaultForm,
      ...initialData,
    };
    if (initialData) {
      if (!base.especialidad && initialData.especialidades && initialData.especialidades.length > 0) {
        base.especialidad = initialData.especialidad || initialData.especialidades[0];
        base.especialidadesExtras = initialData.especialidadesExtras || initialData.especialidades.slice(1);
      }
    }
    return base;
  });
  const [newEspecialidad, setNewEspecialidad] = useState('');
  const newEspRef = useRef<HTMLInputElement>(null);
  const especialidadesExtras = form.especialidadesExtras || [];

  const set = <K extends keyof EspecialistaFormData>(key: K, value: EspecialistaFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errors = useMemo(() => {
    const errs = extractErrors(especialistaSchema.safeParse(form));
    const isSecundaria = form.nivelEducativo === 'Secundaria';
    const isPrimaria = form.nivelEducativo === 'Primaria';

    if (form.cargo === 'Especialista' || form.cargo === 'Jefe de Área') {
      if (isSecundaria && !form.especialidad?.trim()) {
        errs.especialidad = 'La especialidad principal es requerida para el nivel Secundaria';
      }
      if (isPrimaria && form.cargo === 'Especialista') {
        const sp = form.especialidad?.trim();
        if (sp && sp !== 'PIP' && sp !== 'Educación Física' && sp !== 'Educacion Fisica') {
          errs.especialidad = 'La especialidad debe ser PIP o Educación Física';
        }
      }
    }
    return errs;
  }, [form]);

  const isSecundaria = form.nivelEducativo === 'Secundaria';
  const isPrimaria = form.nivelEducativo === 'Primaria';

  const {
    submitted,
    persona,
    searchingDni,
    isDniLocked,
    dniMessage,
    dniBloqueadoPorRol,
    showRoleConfirm,
    setShowRoleConfirm,
    handleSubmit,
    handleConfirmRole,
    dniOk,
    roleCheck,
  } = usePersonForm({
    dni: form.dni,
    isNew: !initialData,
    rolObjetivo: form.cargo === 'Jefe de Área'
      ? 'jefe_area'
      : form.cargo === 'Jefe de Gestión'
        ? 'jefe_gestion'
        : 'especialista',
    cargoObjetivo: form.cargo,
    onValidSubmit: () => {
      const finalForm = {
        ...form,
        especialidades: [
          ...(form.especialidad ? [form.especialidad] : []),
          ...especialidadesExtras,
        ],
      };
      onSubmit(finalForm);
    },
    isLoading,
    errors,
    setPersonaFields: useCallback((persona) => {
      setForm((prev) => {
        const next = { ...prev };
        next.nombres = persona.nombres;
        next.apellidos = persona.apellidos;
        next.correo = persona.correo ?? '';
        next.celular = persona.telefono ?? '';
        if (persona.docente?.cursoAsignado) {
          next.especialidad = persona.docente.cursoAsignado;
        }
        return next;
      });
    }, []),
    clearPersonaFields: useCallback(() => {
      set('nombres', '');
      set('apellidos', '');
      set('correo', '');
      set('celular', '');
    }, []),
  });

  const addEspecialidad = () => {
    const val = newEspecialidad.trim();
    if (!val) return;
    if (val.toLowerCase() === form.especialidad?.trim().toLowerCase()) return;
    if (especialidadesExtras.includes(val)) return;
    set('especialidadesExtras', [...especialidadesExtras, val]);
    setNewEspecialidad('');
    newEspRef.current?.focus();
  };

  const removeEspecialidad = (esp: string) => {
    set('especialidadesExtras', especialidadesExtras.filter((e) => e !== esp));
  };

  const showError = (key: keyof EspecialistaFormData) => (submitted ? errors[key] : '');
  const celularOk = form.celular ? /^9\d{8}$/.test(form.celular) : false;

  const currentModalidad = form.modalidad || 'EBR';
  const availableNiveles = MODALIDAD_NIVEL_MAP[currentModalidad] || [];

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
              onChange={(v) => set('dni', v.replace(/\D/g, '').slice(0, VALIDATION.DNI_LENGTH))}
              placeholder="Ej. 74859612"
              error={showError('dni')}
              adornment={
                searchingDni ? (
                  <Spinner size="sm" />
                ) : dniOk ? (
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
              disabled={isDniLocked || dniBloqueadoPorRol}
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
              disabled={isDniLocked || dniBloqueadoPorRol}
            />
          </div>
        </div>

        {dniMessage && !searchingDni && (
          <div className="mt-4 text-xs font-semibold px-3 py-2.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4" strokeWidth={2.5} />
            {dniMessage}
          </div>
        )}

        {persona && roleCheck.mensaje && (
          <div
            className={`mt-4 text-xs font-semibold px-3 py-2.5 rounded-lg border ${
              roleCheck.bloquea
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span className="font-extrabold uppercase tracking-wide text-[0.72rem]">
              {roleCheck.bloquea ? 'Bloqueado' : 'Advertencia'}:
            </span>{' '}
            {roleCheck.mensaje}
            {roleCheck.detalle && (
              <span className="block mt-1 font-normal text-[0.72rem]">{roleCheck.detalle}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mt-[18px]">
          <TextField
            label="Correo Electrónico"
            value={form.correo || ''}
            onChange={(v) => set('correo', v)}
            placeholder="Ej. jperez@ugel-lampa.gob.pe"
            error={showError('correo')}
            disabled={isDniLocked || dniBloqueadoPorRol}
          />
          <TextField
            label="Número de Celular"
            value={form.celular || ''}
            onChange={(v) => set('celular', v.replace(/\D/g, '').slice(0, VALIDATION.PHONE_LENGTH))}
            placeholder="Ej. 987654321"
            error={showError('celular')}
            disabled={isDniLocked || dniBloqueadoPorRol}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
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
            disabled={dniBloqueadoPorRol}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mt-[18px]">
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
                especialidad: '',
                especialidadesExtras: [],
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
            disabled={dniBloqueadoPorRol}
          />
          <SelectField
            label="Nivel Educativo *"
            required
            value={form.nivelEducativo}
            onChange={(v) => {
              setForm((prev) => ({
                ...prev,
                nivelEducativo: v,
                especialidades: [],
                especialidad: '',
                especialidadesExtras: [],
              }));
            }}
            options={availableNiveles.map((n) => ({ value: n, label: n }))}
            placeholder="Seleccione Nivel"
            error={showError('nivelEducativo')}
            disabled={dniBloqueadoPorRol}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mt-[18px]">
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
            disabled={dniBloqueadoPorRol}
          />
          {/* Especialidad principal */}
          {isPrimaria && (
            <SelectField
              label="Especialidad"
              value={form.especialidad || 'none'}
              onChange={(v) => set('especialidad', v === 'none' ? '' : v)}
              options={[
                { value: 'none', label: 'Ninguna / No aplica' },
                { value: 'PIP', label: 'PIP (Profesor de Innovación Pedagógica)' },
                { value: 'Educación Física', label: 'Educación Física' },
              ]}
              placeholder="Seleccione Especialidad"
              error={showError('especialidad')}
            />
          )}
          {isSecundaria && (
            <TextField
              label="Especialidad Principal *"
              required
              value={form.especialidad || ''}
              onChange={(v) => set('especialidad', v)}
              placeholder="Ej. Matemática, CTA, Comunicación..."
              error={showError('especialidad')}
            />
          )}
        </div>

        {/* Especialidades Extras (solo visible en Secundaria) */}
        {isSecundaria && (
          <div className="flex flex-col gap-1.5 mt-[18px]">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Especialidades Extras / Temporales
              <span className="ml-1 text-text-muted font-normal normal-case">(Opcional)</span>
            </label>
            {/* Tags actuales */}
            {especialidadesExtras.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {especialidadesExtras.map((esp) => (
                  <span
                    key={esp}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {esp}
                    <button
                      type="button"
                      onClick={() => removeEspecialidad(esp)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Input para agregar */}
            <div className="flex gap-2 max-w-md">
              <input
                ref={newEspRef}
                type="text"
                value={newEspecialidad}
                onChange={(e) => setNewEspecialidad(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEspecialidad();
                  }
                }}
                placeholder="Ej. Historia, Inglés..."
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
          </div>
        )}

        <div className="mt-[18px]">
          <TextField
            label="Carga Laboral (Horas) *"
            required
            value={form.cargaLaboral?.toString() || ''}
            onChange={(v) => set('cargaLaboral', v ? Number(v.replace(/\D/g, '')) : 40)}
            placeholder="Ej. 40"
            error={showError('cargaLaboral')}
            disabled={dniBloqueadoPorRol}
          />
        </div>
      </SectionCard>

      {/* Botones de Envío */}
      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </FormButton>
        <FormButton
          onClick={handleSubmit}
          disabled={isLoading || dniBloqueadoPorRol}
        >
          {isLoading ? 'Guardando...' : 'Guardar Datos'}
        </FormButton>
      </div>

      {showRoleConfirm && persona && (
        <ConfirmModal
          title="Confirmar creación con rol adicional"
          message={
            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                La persona <strong>{persona.nombres} {persona.apellidos}</strong> (DNI {persona.dni}) ya está registrada en el sistema.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-amber-800">
                <p className="font-semibold">Roles actuales:</p>
                <ul className="list-disc list-inside mt-1 text-[0.72rem]">
                  {persona.roles.esDirector && <li>Director de I.E.</li>}
                  {persona.roles.esCoordinadorPedagogico && <li>Coordinador Pedagógico</li>}
                  {persona.roles.esJefeTaller && <li>Jefe de Taller</li>}
                  {persona.roles.esDocenteAula && <li>Docente de Aula</li>}
                  {persona.roles.esEspecialista && <li>{persona.roles.especialistaCargoActivo} ({persona.roles.especialistaNivelEducativo})</li>}
                </ul>
              </div>
              <p>
                Se creará un nuevo registro como <strong>{form.cargo}</strong> además de los roles existentes. ¿Desea continuar?
              </p>
            </div>
          }
          confirmLabel="Sí, crear con rol adicional"
          cancelLabel="Cancelar"
          onConfirm={handleConfirmRole}
          onCancel={() => setShowRoleConfirm(false)}
        />
      )}
    </div>
  );
};
