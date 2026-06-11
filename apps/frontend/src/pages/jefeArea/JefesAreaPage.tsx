import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';

import { MOCK_ESPECIALISTAS } from '@entities/model-especialistas';
import { FilterEspecialistas } from '@features/especialistas';
// 🚀 NUEVAS IMPORTACIONES DESDE TU WIDGET TOTALMENTE MODULARIZADO
import { JefesStatsWidget, JefesTableWidget } from '@widgets/jefes-area';

export const JefesAreaPage = () => {
  const navigate = useNavigate();
  
  const [jefes, setJefes] = useState(() => 
    MOCK_ESPECIALISTAS.filter((esp) => esp.rol === 'especialista_bajo')
  );

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in-0 duration-300">
      <PageHeader
        title="Gestión de Jefes de Área"
        description="Padrón oficial de jefes de área de la jurisdicción de la UGEL Lampa."
        action={
          <Button
            onClick={() => navigate('/jefes-area/nuevo')}
            className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 shadow-xs"
          >
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
             Registrar Jefe de Área
          </Button>
        }
      />

      {/* 🚀 Indicadores de Estado exclusivos para Jefes */}
      <JefesStatsWidget jefes={jefes} />

      {/* Barra de Filtros original */}
      <FilterEspecialistas />

      {/* 🚀 Nueva Tabla dedicada con redirección nativa e impecable */}
      <JefesTableWidget
        jefes={jefes}
        setJefes={setJefes}
        onView={(jefe) => navigate(`/jefes-area/${jefe.id}`)}
        onEdit={(jefe) => navigate(`/jefes-area/${jefe.id}/editar`)}
      />
    </div>
  );
};