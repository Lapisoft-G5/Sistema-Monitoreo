import { useState } from 'react';
import { FormButton } from '@shared/ui/form-controls';
import { NIVELES_DEFAULT, crearDesempenoVacio } from '@entities/model-plantillas';
import type { Baremo, NivelCalificacion, Desempeno } from '@entities/model-plantillas';
import { PlantillaCabecera } from './PlantillaCabecera';
import { PlantillaDesempenos } from './PlantillaDesempenos';

export interface PlantillaFormState {
  tipoMonitoreo: string;
  anioAcademico: number;
  baremo: Baremo;
  niveles: NivelCalificacion[];
  desempenos: Desempeno[];
}

interface Props {
  onCancel: () => void;
  onSubmit: (data: PlantillaFormState) => void;
}

export const PlantillaForm = ({ onCancel, onSubmit }: Props) => {
  const [form, setForm] = useState<PlantillaFormState>(() => ({
    tipoMonitoreo: 'Monitoreo Docente',
    anioAcademico: new Date().getFullYear(),
    baremo: 'Vigente',
    niveles: NIVELES_DEFAULT,
    desempenos: [crearDesempenoVacio()],
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

      <div className="flex justify-end gap-3">
        <FormButton variant="secondary" onClick={onCancel}>
          Cancelar
        </FormButton>
        <FormButton onClick={() => onSubmit(form)}>Guardar Plantilla</FormButton>
      </div>
    </div>
  );
};
