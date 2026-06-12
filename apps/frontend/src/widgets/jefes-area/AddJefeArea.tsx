import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { JefeAreaFormBase, useJefeAreaService } from '@features/jefes-area';
import { Card } from '@shared/ui/card';
import type { JefeAreaFormData } from '@entities/model-jefes-area/validator';

export const AddJefeArea = () => {
  const navigate = useNavigate();
  const { createJefeArea, loading, error } = useJefeAreaService();

  const handleFormSubmit = async (formData: JefeAreaFormData) => {
    const result = await createJefeArea(formData, 'jefe_area');
    if (result.success) {
      navigate('/jefes-area');
    }
  };

  const initialData = {
    nombres: '',
    apellidos: '',
    dni: '',
    correo: '',
    celular: '',
    cargaHoraria: 40,
    nivelEducativo: 'SECUNDARIA',
    activo: true,
  } as JefeAreaFormData;

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-8">
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <JefeAreaFormBase
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/jefes-area')}
        isLoading={loading}
      />
    </Card>
  );
};