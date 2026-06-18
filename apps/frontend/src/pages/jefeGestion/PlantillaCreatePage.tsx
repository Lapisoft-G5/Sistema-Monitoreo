import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { PlantillaForm, type PlantillaFormState } from '@widgets/plantillas';

export const PlantillaCreatePage = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: PlantillaFormState) => {
    // La plantilla se almacena en formato JSON.
    const json = JSON.stringify(data, null, 2);
    console.log('Plantilla (JSON):', json);
    // TODO (paso 3-4): persistir + validar unicidad tipo + año.
    navigate(-1);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm"
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
