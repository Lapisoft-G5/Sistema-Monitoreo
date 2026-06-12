import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  InstitutionFormBase,
  type InstitutionRawInput,
} from '@features/institutions/ui/CreateInstitutionFormBase';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { useInstitutionService } from '@features/institutions/institution-service';
import { Card } from '@shared/ui/card';

export const EditInstitutionCard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateInstitution, loading, error } = useInstitutionService();

  const institucion = MOCK_INSTITUCIONES.find((item) => item.id === id);

  if (!institucion) {
    return (
      <div className="p-6 text-center text-text-muted font-medium bg-surface border border-border rounded-2xl">
        No se encontró la institución especificada.
      </div>
    );
  }

  const initialData: InstitutionRawInput = {
    codigoModular: institucion.codigoModular,
    codigoLocal: institucion.codigoLocal || '',
    nombre: institucion.nombre,
    nivel: institucion.nivel,
    provincia: institucion.provincia || '',
    distrito: institucion.distrito,
    zona: institucion.zona || '',
    direccion: institucion.direccion,
    director: institucion.director || '',
    directorTelefono: institucion.directorTelefono || '',
    directorCorreo: institucion.directorCorreo || '',
    modalidad: institucion.modalidad || 'Regular',
  };

  const handleFormSubmit = async (formData: InstitutionRawInput) => {
    if (!id) return;
    const result = await updateInstitution(id, formData);
    if (result.success) {
      navigate('/instituciones/padron');
    }
  };

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <InstitutionFormBase
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/instituciones/padron')}
        isLoading={loading}
      />
    </Card>
  );
};
