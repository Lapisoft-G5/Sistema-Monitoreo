import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { FilterEspecialistas } from '@features/especialistas';
import { EspecialistasStatsWidget, EspecialistasTableWidget } from '@widgets/especialistas';
import { especialistasApi } from '@shared/api/especialistas.api';
import { mapApiEspecialistaToFrontend } from '@features/especialistas/especialista-service';
import type { Especialista } from '@entities/model-especialistas';

export const EspecialistasPage = () => {
  const navigate = useNavigate();
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEspecialistas = async () => {
    setLoading(true);
    const res = await especialistasApi.findAll();
    if (res.ok && res.data) {
      const mapped = res.data.map(mapApiEspecialistaToFrontend);
      // Keep only those that are not Jefes de Área, matching the original behavior
      const filtered = mapped.filter((esp) => esp.rolCode !== 'jefe_area');
      setEspecialistas(filtered);
    } else {
      console.error('Error loading specialists from API:', res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchEspecialistas());
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando especialistas...</span>
      </div>
    );
  }

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
