import { useState } from 'react';
import { Card } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { ConfirmModal } from '@shared/ui/ConfirmModal';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { teachersApi } from '@shared/api/teachers.api';
import type { Docente } from '@entities/model-docentes';

interface DocenteCargosWidgetProps {
  docenteId: string;
  cargosList?: Docente['cargosList'];
  onCargosChanged: () => void;
}

export const DocenteCargosWidget = ({ docenteId, cargosList = [], onCargosChanged }: DocenteCargosWidgetProps) => {
  const [cargoToFinalize, setCargoToFinalize] = useState<{id: string, nombre: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCargos = cargosList.filter((c) => !c.fechaFin);

  const handleFinalize = async () => {
    if (!cargoToFinalize) return;
    setLoading(true);
    setError(null);
    try {
      const res = await teachersApi.finalizeCargo(docenteId, cargoToFinalize.id);
      if (res.ok) {
        setCargoToFinalize(null);
        onCargosChanged(); // refresh the profile
      } else {
        const msg = (res.error as { message?: string })?.message || 'Error al inactivar el cargo.';
        setError(msg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (activeCargos.length === 0) return null;

  return (
    <>
      <Card className="p-6 border border-border shadow-xs flex flex-col gap-4 mt-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-text">Cargos Adicionales Activos</h3>
        </div>
        {error && (
          <div className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {activeCargos.map((cargo) => (
            <div key={cargo.id} className="flex items-center justify-between bg-muted/20 border border-border p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text">{cargo.nombre}</span>
                <span className="text-[0.68rem] text-text-muted mt-0.5">
                  Desde: {cargo.fechaInicio} {cargo.esPrincipal && '(Cargo Principal)'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 border-destructive/20 h-8 text-xs font-bold"
                onClick={() => setCargoToFinalize(cargo)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Inactivar
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {!!cargoToFinalize && (
        <ConfirmModal
          title="¿Inactivar Cargo?"
          message={`¿Estás seguro de que deseas finalizar el cargo de ${cargoToFinalize.nombre}? Se revocará el acceso especial y volverá a ser Docente de Aula si no tiene otros cargos vigentes.`}
          confirmLabel={loading ? 'Inactivando...' : 'Sí, Inactivar'}
          cancelLabel="Cancelar"
          danger={true}
          onConfirm={handleFinalize}
          onCancel={() => setCargoToFinalize(null)}
        />
      )}
    </>
  );
};
