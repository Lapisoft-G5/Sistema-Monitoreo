import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { PlantillasCatalog } from '@widgets/plantillas';

export const PlantillasPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in duration-300">
      {/* ── Encabezado de Página ── */}
      <PageHeader
        title="Catálogo de Plantillas de Monitoreo"
        description="Gestione las versiones vigentes, borradores e históricas de las fichas de evaluación para docentes y directivos."
        action={
          <Button
            onClick={() => navigate('/plantillas/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white shadow"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Registrar Nueva Plantilla
          </Button>
        }
      />

      {/* Catálogo de plantillas refactorizado en widget */}
      <PlantillasCatalog />
    </div>
  );
};
