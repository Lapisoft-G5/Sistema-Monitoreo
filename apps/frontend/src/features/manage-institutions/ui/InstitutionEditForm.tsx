import { useState, useMemo } from 'react';
import type { EstadoMonitoreo, Institucion, Nivel } from './types';
import { DISTRITOS_LAMPA, NIVELES, NIVEL_LABEL, PROVINCIAS, ZONAS } from './types';
import { MOCK_DOCENTES } from '../../entities/teacher/teacher.mock';
import {
  bgApp,
  FormButton,
  SectionCard,
  SelectField,
  TextField,
  textPrimary,
  textSecondary,
  threeCols,
  toOptions,
  twoCols,
} from './form-controls';

/* ============================================================
 * Formulario de edición de una institución existente (vista mock).
 * Recibe la institución seleccionada, precarga los campos y al
 * actualizar entrega el objeto modificado (conservando id y código).
 * ============================================================ */

interface Props {
  institucion: Institucion;
  onCancel: () => void;
  onSubmit: (inst: Institucion) => void;
}

interface FormState {
  nombre: string;
  codigoModular: string;
  nivel: Nivel;
  provincia: string;
  distrito: string;
  zona: string;
  direccion: string;
  estado: EstadoMonitoreo;
  director: string;
  telefono: string;
  correo: string;
}

export const InstitutionEditForm = ({ institucion, onCancel, onSubmit }: Props) => {
  const [form, setForm] = useState<FormState>(() => ({
    nombre: institucion.nombre,
    codigoModular: institucion.codigoModular,
    nivel: institucion.nivel,
    provincia: institucion.provincia ?? '',
    distrito: institucion.distrito,
    zona: institucion.zona ?? '',
    direccion: institucion.direccion,
    estado: institucion.estado,
    director: institucion.director ?? '',
    telefono: institucion.directorTelefono ?? '',
    correo: institucion.directorCorreo ?? '',
  }));
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
        telefono: selectedDir.celular,
        correo: selectedDir.correo,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        director: '',
        telefono: '',
        correo: '',
      }));
    }
  };

  const errors = {
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
      ...institucion,
      nombre: form.nombre.trim(),
      nivel: form.nivel,
      provincia: form.provincia,
      distrito: form.distrito,
      zona: form.zona,
      direccion: form.direccion.trim(),
      estado: form.estado,
      director: form.director.trim() || null,
      directorTelefono: form.telefono.trim() || undefined,
      directorCorreo: form.correo.trim() || undefined,
    });
  };

  return (
    <div style={{ background: bgApp, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, color: textPrimary, minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.82rem', color: textSecondary }}>
        Instituciones <span style={{ margin: '0 6px' }}>›</span> Padrón <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: textPrimary, fontWeight: 600 }}> Editar</span>
      </div>

      {/* Detalles de la Institución */}
      <SectionCard
        title="Detalles de la Institución"
        headerRight={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#dcfce7',
              color: '#15803d',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              padding: '4px 12px',
              borderRadius: 20,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            ESTADO: ACTIVO
          </span>
        }
      >
        <div style={{ marginBottom: 18 }}>
          <TextField
            label="Nombre de la I.E."
            required
            value={form.nombre}
            onChange={(v) => set('nombre', v)}
            placeholder="Nombre de la institución educativa"
            error={showError('nombre')}
          />
        </div>
        <div style={twoCols}>
          <TextField label="Código Modular" value={form.codigoModular} onChange={() => {}} disabled />
          <SelectField
            label="Nivel Educativo"
            required
            value={form.nivel}
            onChange={(v) => set('nivel', v as Nivel)}
            options={NIVELES.map((n) => ({ value: n, label: NIVEL_LABEL[n] }))}
            placeholder="Seleccione Nivel"
            error={showError('nivel')}
          />
        </div>
        <div style={{ ...threeCols, marginTop: 18 }}>
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
          <SelectField
            label="Distrito"
            required
            value={form.distrito}
            onChange={(v) => set('distrito', v)}
            options={toOptions(DISTRITOS_LAMPA)}
            placeholder="Seleccione Distrito"
            error={showError('distrito')}
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <TextField
            label="Dirección"
            required
            value={form.direccion}
            onChange={(v) => set('direccion', v)}
            placeholder="Ej. Jr. Bolognesi 123"
            error={showError('direccion')}
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
      </SectionCard>

      {/* Datos del Director */}
      <SectionCard title="Datos del Director">
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
        <div style={{ ...twoCols, marginTop: 18 }}>
          <TextField
            label="Teléfono de Contacto"
            value={form.telefono}
            onChange={(v) => set('telefono', v)}
            placeholder="Ej. 951 432 789"
          />
          <TextField
            label="Correo Institucional"
            value={form.correo}
            onChange={(v) => set('correo', v)}
            placeholder="Ej. ie71007@ugel-lampa.edu.pe"
          />
        </div>
      </SectionCard>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 12 }}>
        <FormButton onClick={handleSubmit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Actualizar Cambios
        </FormButton>
        <FormButton variant="secondary" onClick={onCancel}>
          Cancelar
        </FormButton>
      </div>
    </div>
  );
};
