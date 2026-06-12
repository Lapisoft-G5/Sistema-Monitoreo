import { useState, useMemo, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';

import { FilterInstitutions } from '@features/institutions/ui/filter-institution';
import { InstitutionsStatsWidget } from '@/widgets/institutions/institutions-stats';
import { InstitutionsTableWidget } from '@/widgets/institutions/institutions-table/ui/institution-table';
import { useNavigate } from 'react-router-dom';
import { institutionsApi } from '@shared/api/institutions.api';
import { mapApiInstitucionToFrontend } from '@features/institutions/institution-service';
import type { Institucion } from '@entities/model-instituciones';

export const InstitucionesPage = () => {
  const navigate = useNavigate();
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstituciones = async () => {
    setLoading(true);
    const res = await institutionsApi.findAll({ limit: 1000 });
    if (res.ok && res.data) {
      const mapped = res.data.data.map(mapApiInstitucionToFrontend);
      setInstituciones(mapped);
    } else {
      console.error('Error loading institutions from API:', res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchInstituciones());
  }, []);

  const distritosOptions = useMemo(
    () => [...new Set(instituciones.map((i) => i.distrito))].sort((a, b) => a.localeCompare(b)),
    [instituciones]
  );

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando instituciones...</span>
      </div>
    );
  }

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