import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { PlantillaForm, type PlantillaFormState } from '@widgets/plantillas';
import { usePlantillas } from '@entities/model-plantillas';
import { useUser } from '@entities/model-user';

export const PlantillaCreatePage = () => {
  const navigate = useNavigate();
  const { addPlantilla } = usePlantillas();
  const { user } = useUser();

  const handleSubmit = (data: PlantillaFormState) => {
    const role: 'director_ie' | 'jefe_gestion' = user?.role === 'director_ie' || user?.role === 'director_institucion' ? 'director_ie' : 'jefe_gestion';
    
    const newPlantilla = {
      id: 'pl-' + Date.now(),
      tipoMonitoreo: data.tipoMonitoreo,
      anioAcademico: Number(data.anioAcademico),
      baremo: data.baremo,
      niveles: data.niveles,
      desempenos: data.desempenos,
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'Borrador' as const,
      descripcion: `Plantilla registrada el ${new Date().toLocaleDateString('es-ES')}. Contiene ${data.desempenos.length} desempeños de evaluación.`,
      creadoPorRole: role,
      creadoPorId: user?.id,
      ieId: user?.institucion,
    };

    addPlantilla(newPlantilla);
    navigate(-1);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm animate-in zoom-in-95 duration-200"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <PageHeader
            title="Registrar Nueva Plantilla"
            description="Complete los campos para dar de alta una plantilla de ficha de monitoreo."
          />
        </div>
      </div>

      <PlantillaForm onCancel={() => navigate(-1)} onSubmit={handleSubmit} />
    </div>
  );
};
