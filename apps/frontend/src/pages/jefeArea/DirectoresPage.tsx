import { useState } from 'react';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { FilterDirectores } from '@features/directores';
import { DirectoresStatsWidget, DirectoresTableWidget } from '@widgets/directores';

export const DirectoresPage = () => {
  const navigate = useNavigate();
  const [directores, setDirectores] = useState(MOCK_DOCENTES);

  // Solo los directores (cargo Director) para los indicadores.
  const soloDirectores = directores.filter((d) => d.cargo === 'Director');

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Gestión de Directores"
        description="Administra el padrón de directores de las instituciones educativas."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-[18px] h-[18px]" strokeWidth={2} />
              Importar desde Excel
            </Button>
            <Button
              onClick={() => navigate('/instituciones/docentes/nuevo')}
              className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
            >
              <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
              Registrar Director
            </Button>
          </div>
        }
      />

      {/* 1. Barra de filtros (controlada por la URL) */}
      <FilterDirectores />

      {/* 2. Tabla de directores */}
      <DirectoresTableWidget
        directores={directores}
        setDirectores={setDirectores}
        instituciones={MOCK_INSTITUCIONES}
        onView={(dir) => navigate(`/instituciones/docentes/${dir.id}`)}
        onEdit={(dir) => navigate(`/instituciones/docentes/${dir.id}/editar`)}
      />

      {/* 3. Indicadores (debajo de la tabla) */}
      <DirectoresStatsWidget directores={soloDirectores} />
    </div>
  );
};
