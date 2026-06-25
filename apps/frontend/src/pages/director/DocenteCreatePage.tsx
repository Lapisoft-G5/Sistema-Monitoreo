import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { CreateDocenteCard } from '@widgets/docentes';
import { fetchInstituciones } from '@features/institutions/institution-service';
import type { Institucion } from '@entities/model-instituciones';

export const DocenteCreatePage = () => {
  const navigate = useNavigate();
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIes = async () => {
      setLoading(true);
      const mapped = await fetchInstituciones({ limit: 1000 });
      setInstituciones(mapped);
      setLoading(false);
    };
    fetchIes();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando formulario...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[820px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/instituciones/docentes')}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <PageHeader
            title="Registrar Nuevo Docente"
            description="Complete los datos para dar de alta un nuevo docente de aula."
          />
        </div>
      </div>

      <CreateDocenteCard
        instituciones={instituciones}
        targetCargo="Docente de Aula"
        routePrefix="/instituciones/docentes"
        submitLabel="Guardar Docente"
      />
    </div>
  );
};
