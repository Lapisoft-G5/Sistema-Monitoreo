import { useState } from 'react';
import { FormButton } from '@shared/ui/form-controls';
import { NIVELES_DEFAULT, crearDesempenoVacio } from '@entities/model-plantillas';
import type { Baremo, NivelCalificacion, Desempeno, EjeItem } from '@entities/model-plantillas';
import { PlantillaCabecera } from './PlantillaCabecera';
import { PlantillaDesempenos } from './PlantillaDesempenos';
import { PlantillaEjesItems } from './PlantillaEjesItems';

export interface PlantillaFormState {
  tipoMonitoreo: string;
  anioAcademico: number;
  baremo: Baremo;
  niveles: NivelCalificacion[];
  desempenos: Desempeno[];
  ejeItems: EjeItem[];
}

interface Props {
  onCancel: () => void;
  onSubmit: (data: PlantillaFormState) => void;
  isSaving?: boolean;
}

export const PlantillaForm = ({ onCancel, onSubmit, isSaving = false }: Props) => {
  const [form, setForm] = useState<PlantillaFormState>(() => ({
    tipoMonitoreo: 'Monitoreo Docente',
    anioAcademico: new Date().getFullYear(),
    baremo: 'Vigente',
    niveles: NIVELES_DEFAULT,
    desempenos: [crearDesempenoVacio()],
    ejeItems: [],
  }));
  const patch = (p: Partial<PlantillaFormState>) => setForm((prev) => ({ ...prev, ...p }));

  return (
    <div className="flex flex-col gap-5">
      <PlantillaCabecera
        tipoMonitoreo={form.tipoMonitoreo}
        anioAcademico={form.anioAcademico}
        baremo={form.baremo}
        niveles={form.niveles}
        onChange={patch}
      />

      <PlantillaDesempenos
        desempenos={form.desempenos}
        niveles={form.niveles}
        onChange={(desempenos) => patch({ desempenos })}
      />

      <PlantillaEjesItems
        ejeItems={form.ejeItems}
        onChange={(ejeItems) => patch({ ejeItems })}
      />

      <div className="flex justify-end gap-3">
        <FormButton variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </FormButton>
        <FormButton onClick={() => onSubmit(form)} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
        </FormButton>
      </div>
    </div>
  );
};
