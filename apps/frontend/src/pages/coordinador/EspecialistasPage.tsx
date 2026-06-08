import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { FilterEspecialistas } from '@features/especialistas';
import { EspecialistasStatsWidget, EspecialistasTableWidget } from '@widgets/especialistas';

export const EspecialistasPage = () => {
  const navigate = useNavigate();
  const [especialistas, setEspecialistas] = useState(MOCK_ESPECIALISTAS);

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Gestión de Especialistas"
        description="Padrón oficial de especialistas de monitoreo pedagógico de la jurisdicción."
        action={
          <Button
            onClick={() => navigate('/especialistas/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Registrar Especialista
          </Button>
        }
      />

      {/* 1. Indicadores de Estado */}
      <EspecialistasStatsWidget especialistas={especialistas} />

      {/* 2. Barra de Filtros */}
      <FilterEspecialistas />

      {/* 3. Tabla de Datos */}
      <EspecialistasTableWidget
        especialistas={especialistas}
        setEspecialistas={setEspecialistas}
        onView={(esp) => navigate(`/especialistas/${esp.id}`)}
      />
    </div>
  );
};
