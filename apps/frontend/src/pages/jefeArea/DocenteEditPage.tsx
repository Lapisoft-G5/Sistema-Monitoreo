import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@shared/ui/pageHeader';
import { EditDocenteCard } from '@widgets/docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { useUser } from '@entities/model-user';

export const DocenteEditPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isDirectorIe = user?.role === 'director_institucion';

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
            title={isDirectorIe ? 'Modificar Datos de Docente' : 'Modificar Datos de Personal'}
            description={
              isDirectorIe
                ? 'Actualice la ficha laboral o de contacto del docente seleccionado.'
                : 'Actualice la ficha laboral o de contacto del director/docente seleccionado.'
            }
          />
        </div>
      </div>

      <EditDocenteCard
        instituciones={MOCK_INSTITUCIONES}
        targetCargo={isDirectorIe ? 'Docente de Aula' : 'Director'}
        submitLabel={isDirectorIe ? 'Guardar Docente' : 'Guardar Director/Docente'}
      />
    </div>
  );
};
