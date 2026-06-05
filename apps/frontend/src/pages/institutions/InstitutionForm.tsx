import { useState } from 'react';
import type { EstadoMonitoreo, Institucion, Nivel } from './types';
import { DISTRITOS_LAMPA, ESTADOS, NIVELES, NIVEL_LABEL, PROVINCIAS, ZONAS } from './types';

/* ============================================================
 * Formulario de registro de una nueva institución (vista mock).
 * Valida los campos obligatorios y, al guardar, entrega el objeto
 * al contenedor (InstitutionsPage) que lo agrega a la lista local.
 * Se conectará al backend cuando exista el CRUD real.
 * ============================================================ */

const bgApp = '#f8fafc';
const cardBg = '#ffffff';
const textPrimary = '#1e293b';
const textSecondary = '#64748b';
const accentBlue = '#0046c7';
const danger = '#ef4444';
const borderCol = '#e2e8f0';
const cardShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';

interface Props {
  onCancel: () => void;
  onSave: (inst: Institucion) => void;
}

interface FormState {
  codigoModular: string;
  nombre: string;
  nivel: '' | Nivel;
  provincia: string;
  distrito: string;
  zona: string;
  direccion: string;
  estado: EstadoMonitoreo;
}

const INITIAL_FORM: FormState = {
  codigoModular: '',
  nombre: '',
  nivel: '',
  provincia: '',
  distrito: '',
  zona: '',
  direccion: '',
  estado: 'Satisfactorio',
};

interface Option {
  value: string;
  label: string;
}

const toOptions = (values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

/* ---------- Subcomponentes de layout ---------- */
const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ background: cardBg, border: `1px solid ${borderCol}`, boxShadow: cardShadow, borderRadius: 12, padding: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <span style={{ color: accentBlue, display: 'flex' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textPrimary }}>{title}</h2>
    </div>
    {children}
  </div>
);

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textPrimary, display: 'block', marginBottom: 6 }}>
    {label}
    {required && <span style={{ color: danger, marginLeft: 2 }}>*</span>}
  </label>
);

const ErrorText = ({ message }: { message: string }) =>
  message ? <span style={{ display: 'block', marginTop: 5, fontSize: '0.72rem', color: danger }}>{message}</span> : null;

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${hasError ? danger : borderCol}`,
  background: cardBg,
  color: textPrimary,
  fontSize: '0.87rem',
  outline: 'none',
  boxSizing: 'border-box',
});

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  adornment,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  adornment?: React.ReactNode;
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...fieldStyle(!!error),
          paddingRight: adornment ? 38 : 12,
          background: disabled ? '#eff6ff' : cardBg,
          color: disabled ? textSecondary : textPrimary,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {adornment && (
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          {adornment}
        </span>
      )}
    </div>
    <ErrorText message={error ?? ''} />
  </div>
);

const SelectInput = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  required?: boolean;
  error?: string;
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...fieldStyle(!!error),
          appearance: 'none',
          WebkitAppearance: 'none',
          paddingRight: 36,
          color: value ? textPrimary : textSecondary,
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: textSecondary, display: 'flex' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
    <ErrorText message={error ?? ''} />
  </div>
);

const twoCols: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18,
};

/* ---------- Formulario ---------- */
export const InstitutionForm = ({ onCancel, onSave }: Props) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const codigoOk = /^\d{7}$/.test(form.codigoModular);
  const errors = {
    codigoModular: !form.codigoModular
      ? 'El código modular es obligatorio'
      : !codigoOk
        ? 'Debe tener exactamente 7 dígitos'
        : '',
    nombre: !form.nombre.trim() ? 'El nombre es obligatorio' : '',
    nivel: !form.nivel ? 'Seleccione un nivel' : '',
    provincia: !form.provincia ? 'Seleccione una provincia' : '',
    distrito: !form.distrito ? 'Seleccione un distrito' : '',
    zona: !form.zona ? 'Seleccione una zona' : '',
    direccion: !form.direccion.trim() ? 'La dirección es obligatoria' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (key: keyof typeof errors) => (submitted ? errors[key] : '');

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors) return;
    onSave({
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      codigoModular: form.codigoModular,
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      nivel: form.nivel as Nivel,
      provincia: form.provincia,
      distrito: form.distrito,
      zona: form.zona,
      director: null,
      estado: form.estado,
    });
  };

  return (
    <div style={{ background: bgApp, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, color: textPrimary, minHeight: '100vh' }}>
      {/* Encabezado + acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary }}>Registrar Nueva Institución</h1>
          <p style={{ margin: '4px 0 0', color: textSecondary, fontSize: '0.87rem' }}>
            Complete los datos oficiales para el padrón de II.EE. de la jurisdicción.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: `1px solid ${borderCol}`,
              background: cardBg,
              color: textSecondary,
              fontSize: '0.87rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: accentBlue,
              color: '#ffffff',
              fontSize: '0.87rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,70,199,0.25)',
            }}
          >
            Guardar Institución
          </button>
        </div>
      </div>

      {/* Información General */}
      <SectionCard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        }
        title="Información General"
      >
        <div style={twoCols}>
          <TextInput
            label="Código Modular (7 dígitos)"
            required
            value={form.codigoModular}
            onChange={(v) => set('codigoModular', v.replace(/\D/g, '').slice(0, 7))}
            placeholder="Ej. 0645213"
            error={showError('codigoModular')}
            adornment={
              codigoOk ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : undefined
            }
          />
          <TextInput
            label="Nombre de la Institución"
            required
            value={form.nombre}
            onChange={(v) => set('nombre', v)}
            placeholder="Ej. I.E. 70045"
            error={showError('nombre')}
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <SelectInput
            label="Nivel Educativo"
            required
            value={form.nivel}
            onChange={(v) => set('nivel', v as '' | Nivel)}
            options={NIVELES.map((n) => ({ value: n, label: NIVEL_LABEL[n] }))}
            placeholder="Seleccione Nivel"
            error={showError('nivel')}
          />
        </div>
      </SectionCard>

      {/* Ubicación Geográfica */}
      <SectionCard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="Ubicación Geográfica"
      >
        <div style={twoCols}>
          <TextInput label="Departamento" value="Puno" onChange={() => {}} disabled />
          <SelectInput
            label="Provincia"
            required
            value={form.provincia}
            onChange={(v) => set('provincia', v)}
            options={toOptions(PROVINCIAS)}
            placeholder="Seleccione Provincia"
            error={showError('provincia')}
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectInput
            label="Distrito"
            required
            value={form.distrito}
            onChange={(v) => set('distrito', v)}
            options={toOptions(DISTRITOS_LAMPA)}
            placeholder="Seleccione Distrito"
            error={showError('distrito')}
          />
          <SelectInput
            label="Zona"
            required
            value={form.zona}
            onChange={(v) => set('zona', v)}
            options={toOptions(ZONAS)}
            placeholder="Seleccione Zona"
            error={showError('zona')}
          />
        </div>
        <div style={{ marginTop: 18 }}>
          <FieldLabel label="Dirección Exacta / Referencia" required />
          <textarea
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            placeholder="Ej. Jr. Comercio s/n (Frente a la plaza principal)"
            rows={3}
            style={{ ...fieldStyle(!!showError('direccion')), resize: 'vertical', fontFamily: 'inherit' }}
          />
          <ErrorText message={showError('direccion')} />
        </div>
      </SectionCard>

      {/* Estado de la Institución */}
      <SectionCard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
        title="Estado de la Institución"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: textSecondary, maxWidth: 480 }}>
            Determine el estado según el monitoreo de la institución.
          </p>
          <div style={{ minWidth: 220 }}>
            <SelectInput
              label="Estado"
              value={form.estado}
              onChange={(v) => set('estado', v as EstadoMonitoreo)}
              options={toOptions(ESTADOS)}
              placeholder="Seleccione Estado"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
