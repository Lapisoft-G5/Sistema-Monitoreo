import { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';

import { FilterInstitutions } from '@features/institutions/ui/filter-institution';
import { InstitutionsStatsWidget } from '@/widgets/institutions/institutions-stats';
import { InstitutionsTableWidget } from '@/widgets/institutions/institutions-table/ui/institution-table';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { useNavigate } from 'react-router-dom';

export const InstitucionesPage = () => {
  const navigate = useNavigate();
  const [instituciones, setInstituciones] = useState(MOCK_INSTITUCIONES);

  const distritosOptions = useMemo(
    () => [...new Set(instituciones.map((i) => i.distrito))].sort((a, b) => a.localeCompare(b)),
    [instituciones]
  );

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader 
        title="Gestión de Instituciones"
        description="Administración del padrón oficial de II.EE."
        action={
          <Button onClick={ () => navigate('/instituciones/nuevo') } className="flex items-center gap-2 font-bold cursor-pointer bg-primary hover:bg-primary-hover text-white">
            <PlusCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            Nueva Institución
          </Button>
        }
      />

      {/* 1. Indicadores de Estado */}
      <InstitutionsStatsWidget instituciones={instituciones} />

      {/* 2. Barra de Filtros (Controlador de la URL) */}
      <FilterInstitutions distritosOptions={distritosOptions} />

      {/* 3. Cuadrícula de Datos (Consumidor de la URL) */}
      <InstitutionsTableWidget 
        instituciones={instituciones}
        setInstituciones={setInstituciones}
        onEdit={() => {}}
        onView={() => {}}
      />
    </div>
  );
};