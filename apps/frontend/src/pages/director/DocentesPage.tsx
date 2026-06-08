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

export const DocentesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [docentes, setDocentes] = useState(MOCK_DOCENTES);

  const userInstId = useMemo(() => {
    if (!user?.institucion) return '1';
    const found = MOCK_INSTITUCIONES.find((i) => i.nombre === user.institucion);
    return found?.id ?? '1';
  }, [user]);

  const filteredDocentes = useMemo(() => {
    return docentes.filter((d) => d.institucionId === userInstId);
  }, [docentes, userInstId]);

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Gestión de Docentes"
        description="Administración y asignación del personal docente de la institución."
        action={
          <Button
            onClick={() => navigate('/instituciones/docentes/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Registrar Docente
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
        targetCargo="Docente de Aula"
        itemName="docentes"
        routePrefix="/instituciones/docentes"
        onView={(doc) => navigate(`/instituciones/docentes/${doc.id}`)}
      />
    </div>
  );
};
