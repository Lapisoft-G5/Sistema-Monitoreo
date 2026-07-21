import type { ReactNode, Ref } from 'react';
import { User, Check } from 'lucide-react';
import { TextField, SectionCard } from '../form-controls';
import { Spinner } from '../Spinner';
import { VALIDATION } from '../../config/constants';

export interface PersonaFormData {
  dni: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  celular?: string;
}

export interface DatosPersonalesSectionProps<T extends PersonaFormData> {
  form: T;
  onChange: <K extends keyof T>(field: K, value: T[K]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showError: (field: any) => string | undefined;
  searchingDni?: boolean;
  dniOk?: boolean;
  celularOk?: boolean;
  isDniLocked?: boolean;
  dniBloqueadoPorRol?: boolean;
  dniMessage?: string | null;
  roleCheck?: {
    mensaje?: string | null;
    bloquea?: boolean;
    detalle?: string | null;
  } | null;
  /** Ref al contenedor del campo Celular, para hacer scroll/focus al error. */
  celularRef?: Ref<HTMLDivElement>;
  extraContent?: ReactNode;
}

export function DatosPersonalesSection<T extends PersonaFormData>({
  form,
  onChange,
  showError,
  searchingDni = false,
  dniOk = false,
  celularOk = false,
  isDniLocked = false,
  dniBloqueadoPorRol = false,
  dniMessage,
  roleCheck,
  celularRef,
  extraContent,
}: DatosPersonalesSectionProps<T>) {
  const isFieldsDisabled = isDniLocked || dniBloqueadoPorRol;

  return (
    <SectionCard icon={<User className="w-5 h-5" />} title="Datos Personales">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-[18px]">
        {/* DNI */}
        <div className="md:col-span-1">
          <TextField
            label="DNI"
            required
            value={form.dni}
            onChange={(v) =>
              onChange('dni' as keyof T, v.replace(/\D/g, '').slice(0, VALIDATION.DNI_LENGTH) as T[keyof T])
            }
            placeholder="8 dígitos"
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

        {/* Nombres */}
        <div className="md:col-span-2">
          <TextField
            label="Nombres"
            required
            value={form.nombres}
            onChange={(v) => onChange('nombres' as keyof T, v as T[keyof T])}
            placeholder="Ej. Juan Carlos"
            error={showError('nombres')}
            disabled={isFieldsDisabled}
          />
        </div>

        {/* Apellidos */}
        <div className="md:col-span-2">
          <TextField
            label="Apellidos"
            required
            value={form.apellidos}
            onChange={(v) => onChange('apellidos' as keyof T, v as T[keyof T])}
            placeholder="Ej. Pérez López"
            error={showError('apellidos')}
            disabled={isFieldsDisabled}
          />
        </div>
      </div>

      {/* DNI Message / Autocomplete Feedback */}
      {dniMessage && !searchingDni && (
        <div className="mt-4 text-xs font-semibold px-3.5 py-2.5 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{dniMessage}</span>
        </div>
      )}

      {/* Role conflict / Warning banner */}
      {roleCheck?.mensaje && (
        <div
          className={`mt-4 text-xs font-semibold px-3.5 py-2.5 rounded-xl border ${
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

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mt-[18px]">
        <TextField
          label="Correo Electrónico"
          value={form.correo || ''}
          onChange={(v) => onChange('correo' as keyof T, v as T[keyof T])}
          placeholder="Ej. jperez@ugel-lampa.gob.pe"
          error={showError('correo')}
          disabled={isFieldsDisabled}
        />
        <div ref={celularRef}>
          <TextField
            label="Número de Celular"
            value={form.celular || ''}
            onChange={(v) =>
              onChange(
                'celular' as keyof T,
                v.replace(/\D/g, '').slice(0, VALIDATION.PHONE_LENGTH) as T[keyof T],
              )
            }
            placeholder="Ej. 987654321"
            error={showError('celular')}
            disabled={isFieldsDisabled}
            adornment={
              celularOk ? (
                <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} />
              ) : undefined
            }
          />
        </div>
      </div>

      {extraContent}
    </SectionCard>
  );
}
