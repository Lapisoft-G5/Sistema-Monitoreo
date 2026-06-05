import type { CSSProperties, ReactNode } from 'react';

/* ============================================================
 * Controles de formulario reutilizables del módulo de
 * Instituciones (compartidos entre el alta y la edición).
 * ============================================================ */

export const bgApp = '#f8fafc';
export const cardBg = '#ffffff';
export const textPrimary = '#1e293b';
export const textSecondary = '#64748b';
export const accentBlue = '#0046c7';
export const danger = '#ef4444';
export const borderCol = '#e2e8f0';
export const cardShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';

export interface Option {
  value: string;
  label: string;
}

export const toOptions = (values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

export const twoCols: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 18,
};

export const threeCols: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 18,
};

export const SectionCard = ({
  icon,
  title,
  headerRight,
  children,
}: {
  icon?: ReactNode;
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) => (
  <div style={{ background: cardBg, border: `1px solid ${borderCol}`, boxShadow: cardShadow, borderRadius: 12, padding: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ color: accentBlue, display: 'flex' }}>{icon}</span>}
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textPrimary }}>{title}</h2>
      </div>
      {headerRight}
    </div>
    {children}
  </div>
);

export const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textPrimary, display: 'block', marginBottom: 6 }}>
    {label}
    {required && <span style={{ color: danger, marginLeft: 2 }}>*</span>}
  </label>
);

export const ErrorText = ({ message }: { message?: string }) =>
  message ? <span style={{ display: 'block', marginTop: 5, fontSize: '0.72rem', color: danger }}>{message}</span> : null;

export const fieldStyle = (hasError: boolean): CSSProperties => ({
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

export const TextField = ({
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
  adornment?: ReactNode;
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
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{adornment}</span>
      )}
    </div>
    <ErrorText message={error} />
  </div>
);

export const SelectField = ({
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
    <ErrorText message={error} />
  </div>
);

export const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...fieldStyle(!!error), resize: 'vertical', fontFamily: 'inherit' }}
    />
    <ErrorText message={error} />
  </div>
);

/* Botón primario / secundario reutilizable para las acciones del formulario */
export const FormButton = ({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 10,
      border: variant === 'primary' ? 'none' : `1px solid ${borderCol}`,
      background: variant === 'primary' ? accentBlue : cardBg,
      color: variant === 'primary' ? '#ffffff' : textSecondary,
      fontSize: '0.87rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: variant === 'primary' ? '0 2px 10px rgba(0,70,199,0.25)' : 'none',
    }}
  >
    {children}
  </button>
);
