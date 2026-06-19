import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';

export const PlantillasPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Catálogo de Plantillas de Monitoreo"
        description="Gestione las versiones vigentes e históricas de las fichas de monitoreo docente y directivo."
        action={
          <Button
            onClick={() => navigate('/plantillas/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Registrar Nueva Plantilla
          </Button>
        }
      />

      {/* TODO: listado de plantillas (lo implementa otra persona). Placeholder por ahora. */}
      <div className="border border-dashed border-border rounded-2xl p-12 text-center text-sm text-text-muted">
        Aquí irá el listado de plantillas registradas.
      </div>
    </div>
  );
};
