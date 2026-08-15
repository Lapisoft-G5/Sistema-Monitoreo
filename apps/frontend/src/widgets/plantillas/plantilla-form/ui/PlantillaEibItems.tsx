import { Plus, Trash2, ListChecks } from 'lucide-react';
import { SectionCard } from '@shared/ui/form-controls';
import type { Desempeno } from '@entities/model-plantillas';

interface Props {
  criterios: Desempeno[];
  onChange: (criterios: Desempeno[]) => void;
}

export const PlantillaEibItems = ({ criterios, onChange }: Props) => {
  const updateCriterio = (id: string, patch: Partial<Desempeno>) =>
    onChange(criterios.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeCriterio = (id: string) =>
    onChange(criterios.filter((c) => c.id !== id));

  const addCriterio = () => {
    const nuevo: Desempeno = {
      id: crypto.randomUUID(),
      nombre: '',
      descripcionCorta: '',
      preguntaExtra: '',
      aspectos: [],
      rubrica: [],
    };
    onChange([...criterios, nuevo]);
  };

  return (
    <SectionCard
      icon={<ListChecks className="w-5 h-5 text-primary" />}
      title="2. Criterios e Ítems de Observación EIB (Lista de Cotejo)"
      headerRight={
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {criterios.length} {criterios.length === 1 ? 'Ítem' : 'Ítems'}
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-text-muted">
          Define los enunciados o prácticas pedagógicas que el especialista verificará en la sesión de aula mediante la escala <strong>Sí / Parcialmente / No</strong>.
        </p>

        <div className="flex flex-col gap-3">
          {criterios.map((criterio, index) => (
            <div
              key={criterio.id}
              className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-surface shadow-xs hover:border-primary/40 transition-colors"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary border border-primary/20 mt-1">
                {index + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-text uppercase tracking-wider">
                    Enunciado / Criterio a Evaluar <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={criterio.nombre}
                    onChange={(e) => updateCriterio(criterio.id, { nombre: e.target.value })}
                    placeholder="Ej. El docente utiliza la lengua originaria y el castellano de acuerdo con la forma de atención EIB..."
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    rows={2}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Foco de Observación / Evidencia Esperada (Opcional)
                  </label>
                  <textarea
                    value={criterio.descripcionCorta ?? ''}
                    onChange={(e) => updateCriterio(criterio.id, { descripcionCorta: e.target.value })}
                    placeholder="Ej. Observar el uso pertinente de la lengua en los momentos de la sesión y materiales del aula..."
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    rows={2}
                  />
                </div>
              </div>

              {criterios.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCriterio(criterio.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer mt-1"
                  aria-label="Eliminar criterio"
                  title="Eliminar criterio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCriterio}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border py-4 text-text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer mt-1"
        >
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Agregar Criterio / Ítem EIB</span>
          </div>
          <span className="text-xs text-text-muted">Añade un nuevo enunciado a la lista de cotejo de observación</span>
        </button>
      </div>
    </SectionCard>
  );
};
