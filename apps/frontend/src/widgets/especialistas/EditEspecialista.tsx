import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { EspecialistaFormBase } from '@features/especialistas';
import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { useEspecialistaService } from '@features/especialistas';
import { Card } from '@shared/ui/card';
import type { EspecialistaFormData } from '@entities/model-especialistas/validator';

export const EditEspecialistaCard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEspecialista, loading, error } = useEspecialistaService();

  const especialista = MOCK_ESPECIALISTAS.find((item) => item.id === id);

  if (!especialista) {
    return (
      <div className="p-6 text-center text-text-muted font-medium bg-surface border border-border rounded-2xl">
        No se encontró el registro de especialista especificado.
      </div>
    );
  }

  const initialData: EspecialistaFormData = {
    nombres: especialista.nombres,
    apellidos: especialista.apellidos,
    dni: especialista.dni,
    correo: especialista.correo,
    celular: especialista.celular,
    especialidad: especialista.especialidad,
    rol: especialista.rol,
    niveles: especialista.niveles,
    activo: especialista.activo,
    cargaLaboral: especialista.cargaLaboral,
  };

  const handleFormSubmit = async (formData: EspecialistaFormData) => {
    if (!id) return;
    const result = await updateEspecialista(id, formData);
    if (result.success) {
      navigate('/especialistas');
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

      <EspecialistaFormBase
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/especialistas')}
        isLoading={loading}
      />
    </Card>
  );
};
