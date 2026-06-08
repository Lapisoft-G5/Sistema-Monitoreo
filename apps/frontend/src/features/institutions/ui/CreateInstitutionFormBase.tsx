import { useState, useMemo } from 'react';
import { Book, MapPin, User as UserIcon, Check } from 'lucide-react';
import { DISTRITOS_LAMPA, NIVELES, NIVEL_LABEL, PROVINCIAS, ZONAS, type Nivel } from '@entities/model-instituciones/constants';
import { FormButton, SectionCard, SelectField, TextAreaField, TextField, toOptions, twoCols } from '@shared/ui/form-controls';

export interface InstitutionRawInput {
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

interface Props {
  onCancel: () => void;
  onSubmit: (data: InstitutionRawInput) => void;
  isLoading: boolean;
  initialData?: InstitutionRawInput;
}

const INITIAL_FORM: InstitutionRawInput = {
  codigoModular: '', nombre: '', nivel: '', provincia: '', distrito: '',
  zona: '', direccion: '', director: '', directorTelefono: '', directorCorreo: '',
};

const MOCK_DOCENTES = [{ dni: '87654321', nombres: 'Juan Pérez', cargo: 'Director', celular: '987654321', correo: 'juan@ugel.edu.pe' }];

export const InstitutionFormBase = ({ onCancel, onSubmit, isLoading, initialData }: Props) => {
  const [form, setForm] = useState<InstitutionRawInput>(initialData || INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [dniSearch, setDniSearch] = useState('');

  const directors = useMemo(() => MOCK_DOCENTES.filter((d) => d.cargo === 'Director'), []);
  const filteredDirectors = useMemo(() => directors.filter((d) => (dniSearch ? d.dni.includes(dniSearch) : true)), [directors, dniSearch]);
  const directorOptions = useMemo(() => filteredDirectors.map((d) => ({ value: d.nombres, label: `${d.nombres} (DNI: ${d.dni})` })), [filteredDirectors]);

  const set = <K extends keyof InstitutionRawInput>(key: K, value: InstitutionRawInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectDirector = (name: string) => {
    const selectedDir = directors.find((d) => d.nombres === name);
    if (selectedDir) {
      setForm((prev) => ({ ...prev, director: selectedDir.nombres, directorTelefono: selectedDir.celular, directorCorreo: selectedDir.correo }));
    } else {
      setForm((prev) => ({ ...prev, director: '', directorTelefono: '', directorCorreo: '' }));
    }
  };

  const codigoOk = /^\d{7}$/.test(form.codigoModular);
  const errors = {
    codigoModular: !form.codigoModular ? 'Obligatorio' : !codigoOk ? 'Deben ser 7 dígitos' : '',
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
            label="Nombre de la Institución" required value={form.nombre}
            onChange={(v) => set('nombre', v)} placeholder="Ej. I.E. 70045" error={showError('nombre')}
          />
        </div>
        <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
          <SelectField
            label="Nivel Educativo" required value={form.nivel}
            onChange={(v) => set('nivel', v as '' | Nivel)}
            options={NIVELES.map((n) => ({ value: n, label: NIVEL_LABEL[n] }))}
            placeholder="Seleccione Nivel" error={showError('nivel')}
          />
        </div>
      </SectionCard>

      <SectionCard icon={<MapPin className="w-5 h-5" />} title="Ubicación Geográfica">
        <div style={twoCols}>
          <TextField label="Departamento" value="Puno" onChange={() => {}} disabled />
          <SelectField
            label="Provincia" required value={form.provincia}
            onChange={(v) => set('provincia', v)} options={toOptions(PROVINCIAS)}
            placeholder="Seleccione Provincia" error={showError('provincia')}
          />
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
            label="Asignar Director" value={form.director} onChange={(v) => handleSelectDirector(v)}
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