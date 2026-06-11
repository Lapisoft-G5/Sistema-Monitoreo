import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { EspecialistaFormBase } from '@features/especialistas';
import { useEspecialistaService } from '@features/especialistas';
import { Card } from '@shared/ui/card';

import type { EspecialistaFormData } from '@entities/model-especialistas/validator';

export const AddJefeArea = () => {
  const navigate = useNavigate();
  const { createEspecialista, loading, error } = useEspecialistaService();

  const handleFormSubmit = async (formData: EspecialistaFormData) => {
    // 🚀 Agregamos "as const" para decirle a TS que es el valor literal exacto
    const finalData = { 
      ...formData, 
      rol: 'especialista_bajo' as const 
    };
    
    const result = await createEspecialista(finalData);
    if (result.success) {
      navigate('/jefes-area');
    }
  };

  // Pre-configuramos el rol por defecto en el formulario base
  const initialData = { rol: 'especialista_bajo' } as EspecialistaFormData;

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-8">
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <EspecialistaFormBase
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/jefes-area')}
        isLoading={loading}
      />
    </Card>
  );
};