import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { FilterDocentes } from '@features/docentes';
import { DocentesStatsWidget, DocentesTableWidget } from '@widgets/docentes';

export const JefesGestionPage = () => {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState(MOCK_DOCENTES);

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Gestión de Jefes de Gestión"
        description="Administración y asignación del personal de gestión pedagógica de la jurisdicción."
        action={
          <Button
            onClick={() => navigate('/instituciones/coordinadores/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Registrar Jefe de Gestión
          </Button>
        }
      />

      {/* 1. Indicadores de Estado */}
      <DocentesStatsWidget docentes={docentes} />

      {/* 2. Barra de Filtros (Controlador de la URL) */}
      <FilterDocentes />

      {/* 3. Tabla de Datos */}
      <DocentesTableWidget
        docentes={docentes}
        setDocentes={setDocentes}
        instituciones={MOCK_INSTITUCIONES}
        targetCargo="Coordinador Pedagógico"
        routePrefix="/instituciones/coordinadores"
        itemName="jefes de gestión"
        onView={(doc) => navigate(`/instituciones/coordinadores/${doc.id}`)}
      />
    </div>
  );
};
