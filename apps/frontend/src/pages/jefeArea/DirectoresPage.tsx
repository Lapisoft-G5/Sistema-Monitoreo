import { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { FilterDocentes } from '@features/docentes';
import { DocentesStatsWidget, DocentesTableWidget } from '@widgets/docentes';
import { useUser } from '@entities/model-user';

export const DirectoresPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [docentes, setDocentes] = useState(MOCK_DOCENTES);

  const isDirectorIe = user?.role === 'director_institucion';

  const userInstId = useMemo(() => {
    if (!isDirectorIe || !user?.institucion) return null;
    const found = MOCK_INSTITUCIONES.find((i) => i.nombre === user.institucion);
    return found?.id ?? '1';
  }, [isDirectorIe, user]);

  const filteredDocentes = useMemo(() => {
    if (!isDirectorIe || !userInstId) return docentes;
    return docentes.filter((d) => d.institucionId === userInstId);
  }, [docentes, isDirectorIe, userInstId]);

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title={isDirectorIe ? 'Gestión de Docentes' : 'Gestión de Directores y Docentes'}
        description={
          isDirectorIe
            ? 'Administración y asignación del personal docente de la institución.'
            : 'Administración y asignación del personal directivo y docente de la jurisdicción.'
        }
        action={
          <Button
            onClick={() => navigate('/instituciones/docentes/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            {isDirectorIe ? 'Registrar Docente' : 'Registrar Personal'}
          </Button>
        }
      />

      {/* 1. Indicadores de Estado */}
      <DocentesStatsWidget docentes={filteredDocentes} />

      {/* 2. Barra de Filtros (Controlador de la URL) */}
      <FilterDocentes />

      {/* 3. Tabla de Datos */}
      <DocentesTableWidget
        docentes={filteredDocentes}
        setDocentes={setDocentes}
        instituciones={MOCK_INSTITUCIONES}
        targetCargo={isDirectorIe ? 'Docente de Aula' : 'Director'}
        itemName={isDirectorIe ? 'docentes' : 'directores/docentes'}
        onView={(doc) => navigate(`/instituciones/docentes/${doc.id}`)}
      />
    </div>
  );
};
