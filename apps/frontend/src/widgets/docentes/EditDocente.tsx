import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { DocenteFormBase } from '@features/docentes';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import { useDocenteService } from '@features/docentes';
import { Card } from '@shared/ui/card';
import type { DocenteFormData } from '@entities/model-docentes/validator';

interface Props {
  instituciones: { id: string; nombre: string }[];
  targetCargo?: 'Director' | 'Coordinador Pedagógico';
  routePrefix?: string;
  submitLabel?: string;
}

export const EditDocenteCard = ({
  instituciones,
  targetCargo = 'Director',
  routePrefix = '/instituciones/docentes',
  submitLabel,
}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateDocente, loading, error } = useDocenteService();

  const docente = MOCK_DOCENTES.find((item) => item.id === id);

  if (!docente) {
    return (
      <div className="p-6 text-center text-text-muted font-medium bg-surface border border-border rounded-2xl">
        No se encontró el registro de personal especificado.
      </div>
    );
  }

  const initialData: DocenteFormData = {
    nombres: docente.nombres,
    apellidos: docente.apellidos,
    dni: docente.dni,
    correo: docente.correo,
    celular: docente.celular,
    nivelEducativo: docente.nivelEducativo,
    condicion: docente.condicion,
    especialidad: docente.especialidad,
    cargaHoraria: docente.cargaHoraria,
    secciones: docente.secciones || [],
    escala: docente.escala,
    institucionId: docente.institucionId,
    activo: docente.activo,
    cargo: docente.cargo,
  };

  const handleFormSubmit = async (formData: DocenteFormData) => {
    if (!id) return;
    const result = await updateDocente(id, formData);
    if (result.success) {
      navigate(routePrefix);
    }
  };

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <DocenteFormBase
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate(routePrefix)}
        isLoading={loading}
        instituciones={instituciones}
        defaultCargo={targetCargo}
        submitLabel={submitLabel}
      />
    </Card>
  );
};
