import { useState, useMemo, useEffect } from 'react';
import { Book, MapPin, User as UserIcon, Check } from 'lucide-react';
import { DISTRITOS_LAMPA, NIVELES, NIVEL_LABEL, ZONAS, type Nivel } from '@entities/model-instituciones/constants';
import { FormButton, SectionCard, SelectField, TextAreaField, TextField, toOptions, twoCols } from '@shared/ui/form-controls';
import { teachersApi } from '@shared/api/teachers.api';
import { mapApiDocenteToFrontend } from '@features/docentes/docente-service';
import type { Docente } from '@entities/model-docentes';

export interface InstitutionRawInput {
  codigoModular: string;
  codigoLocal: string;
  nombre: string;
  nivel: '' | Nivel;
  provincia: string;
  distrito: string;
  zona: string;
  direccion: string;
  director: string;
  directorTelefono: string;
  directorCorreo: string;
  directorDni?: string;
  modalidad?: string;
}

interface Props {
  onCancel: () => void;
  onSubmit: (data: InstitutionRawInput) => void;
  isLoading: boolean;
  initialData?: InstitutionRawInput;
}

const INITIAL_FORM: InstitutionRawInput = {
  codigoModular: '', codigoLocal: '', nombre: '', nivel: '', provincia: 'Lampa', distrito: '',
  zona: '', direccion: '', director: '', directorTelefono: '', directorCorreo: '', directorDni: '', modalidad: 'Regular',
};

export const InstitutionFormBase = ({ onCancel, onSubmit, isLoading, initialData }: Props) => {
  const [form, setForm] = useState<InstitutionRawInput>(initialData || INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [dniSearch, setDniSearch] = useState('');
  const [directors, setDirectors] = useState<Docente[]>([]);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const res = await teachersApi.findAll();
        if (res.ok && res.data) {
          const mapped = res.data.map(mapApiDocenteToFrontend);
          const filtered = mapped.filter((d) => d.cargo === 'Director' || d.cargo === 'Coordinador Pedagógico');
          setDirectors(filtered);
        }
      } catch (err) {
        console.error('Error fetching directors:', err);
      }
    };
    Promise.resolve().then(() => fetchDirectors());
  }, []);

  const filteredDirectors = useMemo(() => directors.filter((d) => (dniSearch ? d.dni.includes(dniSearch) : true)), [directors, dniSearch]);
  const directorOptions = useMemo(() => filteredDirectors.map((d) => ({ value: d.dni, label: `${d.nombres} ${d.apellidos} (DNI: ${d.dni})` })), [filteredDirectors]);

  const set = <K extends keyof InstitutionRawInput>(key: K, value: InstitutionRawInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectDirector = (dni: string) => {
    const selectedDir = directors.find((d) => d.dni === dni);
    if (selectedDir) {
      setForm((prev) => ({ 
        ...prev, 
        director: `${selectedDir.nombres} ${selectedDir.apellidos}`.trim(), 
        directorTelefono: selectedDir.celular, 
        directorCorreo: selectedDir.correo,
        directorDni: selectedDir.dni,
      }));
    } else {
      setForm((prev) => ({ 
        ...prev, 
        director: '', 
        directorTelefono: '', 
        directorCorreo: '',
        directorDni: '',
      }));
    }
  };

  const codigoOk = /^\d{7}$/.test(form.codigoModular);
  const codigoLocalOk = /^\d{8}$/.test(form.codigoLocal);
  const errors = {
    codigoModular: !form.codigoModular ? 'Obligatorio' : !codigoOk ? 'Deben ser 7 dígitos' : '',
    codigoLocal: !form.codigoLocal ? 'Obligatorio' : !codigoLocalOk ? 'Deben ser 8 dígitos' : '',
    nombre: !form.nombre.trim() ? 'Obligatorio' : '',
    nivel: !form.nivel ? 'Seleccione nivel' : '',
    provincia: !form.provincia ? 'Seleccione provincia' : '',
    distrito: !form.distrito ? 'Seleccione distrito' : '',
    zona: !form.zona ? 'Seleccione zona' : '',
    direccion: !form.direccion.trim() ? 'Obligatorio' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (key: keyof typeof errors) => (submitted ? errors[key] : '');

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors || isLoading) return;
    onSubmit(form);
  };

  return (
    <div className="bg-bg p-0 flex flex-col gap-5 text-text">
      <SectionCard icon={<Book className="w-5 h-5" />} title="Información General">
        <div style={twoCols}>
          <TextField
            label="Código Modular (7 dígitos)" required value={form.codigoModular}
            onChange={(v) => set('codigoModular', v.replace(/\D/g, '').slice(0, 7))}
            placeholder="Ej. 0645213" error={showError('codigoModular')}
            adornment={codigoOk ? <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} /> : undefined}
          />
          <TextField
            label="Código de Local (8 dígitos)" required value={form.codigoLocal}
            onChange={(v) => set('codigoLocal', v.replace(/\D/g, '').slice(0, 8))}
            placeholder="Ej. 12457896" error={showError('codigoLocal')}
            adornment={codigoLocalOk ? <Check className="w-[18px] h-[18px] text-green-500" strokeWidth={2.5} /> : undefined}
          />
        </div>
        <div className="w-full mt-[18px]">
          <TextField
            label="Nombre de la Institución Educativa" required value={form.nombre}
            onChange={(v) => set('nombre', v)} placeholder="Ej. I.E. 70045" error={showError('nombre')}
          />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Nivel Educativo" required value={form.nivel}
            onChange={(v) => set('nivel', v as '' | Nivel)}
            options={NIVELES.map((n) => ({ value: n, label: NIVEL_LABEL[n] }))}
            placeholder="Seleccione Nivel" error={showError('nivel')}
          />
          <SelectField
            label="Modalidad" value={form.modalidad || 'Regular'}
            onChange={(v) => set('modalidad', v)}
            options={[
              { value: 'Regular', label: 'Regular / General' },
              { value: 'PRONOEI', label: 'PRONOEI' },
              { value: 'EBA', label: 'Educación Básica Alternativa (EBA)' },
              { value: 'EBE', label: 'Educación Básica Especial (EBE)' },
            ]}
            placeholder="Seleccione Modalidad"
          />
        </div>
      </SectionCard>

      <SectionCard icon={<MapPin className="w-5 h-5" />} title="Ubicación Geográfica">
        <div style={twoCols}>
          <TextField label="Departamento" value="Puno" onChange={() => {}} disabled />
          <TextField label="Provincia" value="Lampa" onChange={() => {}} disabled />
        </div>
        <div style={{ ...twoCols, marginTop: 18 }}>
          <SelectField
            label="Distrito" required value={form.distrito}
            onChange={(v) => set('distrito', v)} options={toOptions(DISTRITOS_LAMPA)}
            placeholder="Seleccione Distrito" error={showError('distrito')}
          />
          <SelectField
            label="Zona" required value={form.zona}
            onChange={(v) => set('zona', v)} options={toOptions(ZONAS)}
            placeholder="Seleccione Zona" error={showError('zona')}
          />
        </div>
        <div style={{ marginTop: 18 }}>
          <TextAreaField
            label="Dirección Exacta / Referencia" required value={form.direccion}
            onChange={(v) => set('direccion', v)} placeholder="Ej. Jr. Comercio s/n"
            error={showError('direccion')}
          />
        </div>
      </SectionCard>

      <SectionCard icon={<UserIcon className="w-5 h-5" />} title="Director de la Institución (Opcional)">
        <div style={twoCols}>
          <TextField
            label="Buscar por DNI" value={dniSearch}
            onChange={(v) => setDniSearch(v.replace(/\D/g, '').slice(0, 8))} placeholder="Ej. 87654321"
          />
          <SelectField
            label="Asignar Director" value={form.directorDni || ''} onChange={(v) => handleSelectDirector(v)}
            options={directorOptions} placeholder={dniSearch ? "Seleccione Director encontrado" : "Seleccione un Director"}
          />
        </div>
        {form.director && (
          <div style={{ ...twoCols, marginTop: 18 }}>
            <TextField label="Teléfono de Contacto" value={form.directorTelefono} onChange={() => {}} disabled />
            <TextField label="Correo Electrónico" value={form.directorCorreo} onChange={() => {}} disabled />
          </div>
        )}
      </SectionCard>

      <div className="flex justify-end gap-3 mt-2">
        <FormButton variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</FormButton>
        <FormButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Institución'}
        </FormButton>
      </div>
    </div>
  );
};