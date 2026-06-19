import { ClipboardList, Plus, Trash2, X } from 'lucide-react';
import { FieldLabel, SectionCard, TextField } from '@shared/ui/form-controls';
import { crearAspectoVacio, crearDesempenoVacio } from '@entities/model-plantillas';
import type { Desempeno, NivelCalificacion, NivelRomano } from '@entities/model-plantillas';

interface Props {
  desempenos: Desempeno[];
  niveles: NivelCalificacion[];
  onChange: (desempenos: Desempeno[]) => void;
}

export const PlantillaDesempenos = ({ desempenos, niveles, onChange }: Props) => {
  const updateDesempeno = (id: string, patch: Partial<Desempeno>) =>
    onChange(desempenos.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const removeDesempeno = (id: string) => onChange(desempenos.filter((d) => d.id !== id));

  const addDesempeno = () => onChange([...desempenos, crearDesempenoVacio()]);

  return (
    <SectionCard icon={<ClipboardList className="w-5 h-5" />} title="2. Gestión de Desempeños">
      <div className="flex flex-col gap-4">
        {desempenos.map((desempeno, index) => (
          <DesempenoCard
            key={desempeno.id}
            index={index}
            desempeno={desempeno}
            niveles={niveles}
            puedeEliminar={desempenos.length > 1}
            onChange={(patch) => updateDesempeno(desempeno.id, patch)}
            onRemove={() => removeDesempeno(desempeno.id)}
          />
        ))}

        <button
          type="button"
          onClick={addDesempeno}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border py-6 text-text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-sm font-semibold">Agregar Nuevo Desempeño</span>
          <span className="text-xs">Haga clic para expandir la estructura de la rúbrica</span>
        </button>
      </div>
    </SectionCard>
  );
};

interface DesempenoCardProps {
  index: number;
  desempeno: Desempeno;
  niveles: NivelCalificacion[];
  puedeEliminar: boolean;
  onChange: (patch: Partial<Desempeno>) => void;
  onRemove: () => void;
}

const DesempenoCard = ({
  index,
  desempeno,
  niveles,
  puedeEliminar,
  onChange,
  onRemove,
}: DesempenoCardProps) => {
  const setAspecto = (id: string, descripcion: string) =>
    onChange({
      aspectos: desempeno.aspectos.map((a) => (a.id === id ? { ...a, descripcion } : a)),
    });

  const addAspecto = () => onChange({ aspectos: [...desempeno.aspectos, crearAspectoVacio()] });

  const removeAspecto = (id: string) =>
    onChange({ aspectos: desempeno.aspectos.filter((a) => a.id !== id) });

  const setRubrica = (nivel: NivelRomano, descripcion: string) =>
    onChange({
      rubrica: desempeno.rubrica.map((r) => (r.nivel === nivel ? { ...r, descripcion } : r)),
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Encabezado del desempeño */}
      <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-text">Desempeño N° {index + 1}</span>
        </div>
        {puedeEliminar && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs font-bold text-destructive transition-colors hover:text-destructive/80 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ELIMINAR
          </button>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col gap-5 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextField
            label="Nombre del Desempeño"
            required
            value={desempeno.nombre}
            onChange={(v) => onChange({ nombre: v })}
            placeholder="Ej. Involucra activamente a los estudiantes..."
          />
          <TextField
            label="Descripción Corta"
            value={desempeno.descripcionCorta}
            onChange={(v) => onChange({ descripcionCorta: v })}
            placeholder="Breve contexto del desempeño..."
          />
        </div>

        {/* Aspectos evaluados (checklist) */}
        <div className="flex flex-col gap-2">
          <FieldLabel label="Aspectos Evaluados (Checklist)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {desempeno.aspectos.map((aspecto) => (
              <div key={aspecto.id} className="relative">
                <input
                  value={aspecto.descripcion}
                  onChange={(e) => setAspecto(aspecto.id, e.target.value)}
                  placeholder="Describe el aspecto a evaluar"
                  className="w-full rounded-lg border border-input bg-transparent py-2 pl-3 pr-9 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeAspecto(aspecto.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-destructive cursor-pointer"
                  aria-label="Eliminar aspecto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAspecto}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            AGREGAR ASPECTO
          </button>
        </div>

        {/* Detalle de rúbrica por niveles */}
        <div className="flex flex-col gap-2">
          <FieldLabel label="Detalle de Rúbrica por Niveles" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {niveles.map((nivel) => {
              const entry = desempeno.rubrica.find((r) => r.nivel === nivel.nivel);
              return (
                <div
                  key={nivel.nivel}
                  className="flex flex-col overflow-hidden rounded-xl border border-border"
                >
                  <div
                    className="px-3 py-1.5 text-xs font-bold text-text"
                    style={{ backgroundColor: `${nivel.color}26` }}
                  >
                    Nivel {nivel.nivel}
                  </div>
                  <textarea
                    value={entry?.descripcion ?? ''}
                    onChange={(e) => setRubrica(nivel.nivel, e.target.value)}
                    placeholder="Describa el comportamiento para este nivel..."
                    className="min-h-[90px] resize-none bg-transparent px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
