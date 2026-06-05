import { useState, useMemo } from 'react';
import type { Institucion, Nivel } from './types';
import { DISTRITOS_LAMPA, NIVELES, NIVEL_LABEL, PROVINCIAS, ZONAS } from './types';
import { MOCK_DOCENTES } from '../../entities/teacher/teacher.mock';
import {
  bgApp,
  FormButton,
  SectionCard,
  SelectField,
  TextAreaField,
  TextField,
  textPrimary,
  textSecondary,
  toOptions,
  twoCols,
} from './form-controls';

/* ============================================================
 * Formulario de alta de una nueva institución (vista mock).
 * Valida los obligatorios y entrega el objeto al contenedor.
 * ============================================================ */

interface Props {
  onCancel: () => void;
  onSubmit: (inst: Institucion) => void;
}

interface FormState {
  codigoModular: string;
  nombre: string;
  nivel: '' | Nivel;
  provincia: string;
  distrito: string;
  zona: string;
  direccion: string;
  director: string;
  directorTelefono: string;
  directorCorreo: string;
}

const INITIAL_FORM: FormState = {
  codigoModular: '',
  nombre: '',
  nivel: '',
  provincia: '',
  distrito: '',
  zona: '',
  direccion: '',
  director: '',
  directorTelefono: '',
  directorCorreo: '',
};

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const InstitutionForm = ({ onCancel, onSubmit }: Props) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [dniSearch, setDniSearch] = useState('');

  const directors = useMemo(() => MOCK_DOCENTES.filter((d) => d.cargo === 'Director'), []);

  const filteredDirectors = useMemo(() => {
    return directors.filter((d) => (dniSearch ? d.dni.includes(dniSearch) : true));
  }, [directors, dniSearch]);

  const directorOptions = useMemo(() => {
    return filteredDirectors.map((d) => ({
      value: d.nombres,
      label: `${d.nombres} (DNI: ${d.dni})`,
    }));
  }, [filteredDirectors]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectDirector = (name: string) => {
    const selectedDir = directors.find((d) => d.nombres === name);
    if (selectedDir) {
      setForm((prev) => ({
        ...prev,
        director: selectedDir.nombres,
        directorTelefono: selectedDir.celular,
        directorCorreo: selectedDir.correo,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        director: '',
        directorTelefono: '',
        directorCorreo: '',
      }));
    }
  };

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
    onSubmit({
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      codigoModular: form.codigoModular,
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      nivel: form.nivel as Nivel,
      provincia: form.provincia,
      distrito: form.distrito,
      zona: form.zona,
      director: form.director.trim() || null,
      directorTelefono: form.directorTelefono.trim() || undefined,
      directorCorreo: form.directorCorreo.trim() || undefined,
      estado: 'Satisfactorio',
    });
  };

  return (
    <div style={{ background: bgApp, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, color: textPrimary, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary }}>Registrar Nueva Institución</h1>
          <p style={{ margin: '4px 0 0', color: textSecondary, fontSize: '0.87rem' }}>
            Complete los datos oficiales para el padrón de II.EE. de la jurisdicción.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <FormButton variant="secondary" onClick={onCancel}>
            Cancelar
          </FormButton>
          <FormButton onClick={handleSubmit}>Guardar Institución</FormButton>
        </div>
      </div>

      <SectionCard icon={<BookIcon />} title="Información General">
        <div style={twoCols}>
          <TextField
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
          <TextField
            label="Nombre de la Institución"
            required
            value={form.nombre}
            onChange={(v) => set('nombre', v)}
            placeholder="Ej. I.E. 70045"
            error={showError('nombre')}
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <SelectField
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

      <SectionCard icon={<MapPinIcon />} title="Ubicación Geográfica">
        <div style={twoCols}>
          <TextField label="Departamento" value="Puno" onChange={() => {}} disabled />
          <SelectField
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
          <SelectField
            label="Distrito"
            required
            value={form.distrito}
            onChange={(v) => set('distrito', v)}
            options={toOptions(DISTRITOS_LAMPA)}
            placeholder="Seleccione Distrito"
            error={showError('distrito')}
          />
          <SelectField
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
          <TextAreaField
            label="Dirección Exacta / Referencia"
            required
            value={form.direccion}
            onChange={(v) => set('direccion', v)}
            placeholder="Ej. Jr. Comercio s/n (Frente a la plaza principal)"
            error={showError('direccion')}
          />
        </div>
      </SectionCard>

      <SectionCard icon={<UserIcon />} title="Director de la Institución (Opcional)">
        <div style={twoCols}>
          <TextField
            label="Buscar por DNI del Director"
            value={dniSearch}
            onChange={(v) => setDniSearch(v.replace(/\D/g, '').slice(0, 8))}
            placeholder="Ej. 87654321"
          />
          <SelectField
            label="Asignar Director"
            value={form.director}
            onChange={(v) => handleSelectDirector(v)}
            options={directorOptions}
            placeholder={dniSearch ? "Seleccione Director encontrado" : "Seleccione un Director"}
          />
        </div>
        {form.director && (
          <div style={{ ...twoCols, marginTop: 18 }}>
            <TextField label="Teléfono de Contacto" value={form.directorTelefono} onChange={() => {}} disabled />
            <TextField label="Correo Electrónico" value={form.directorCorreo} onChange={() => {}} disabled />
          </div>
        )}
      </SectionCard>
    </div>
  );
};
