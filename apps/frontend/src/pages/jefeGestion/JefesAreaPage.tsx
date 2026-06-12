import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';

import { FilterEspecialistas } from '@features/especialistas';
import { JefesStatsWidget, JefesTableWidget } from '@widgets/jefes-area';
import { especialistasApi } from '@shared/api/especialistas.api';
import { mapApiEspecialistaToFrontend } from '@features/especialistas/especialista-service';
import type { Especialista } from '@entities/model-especialistas';

export const JefesAreaPage = () => {
  const navigate = useNavigate();
  const [jefes, setJefes] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJefes = async () => {
    setLoading(true);
    try {
      const res = await especialistasApi.findAll();
      if (res.ok && res.data) {
        const mapped = res.data.map(mapApiEspecialistaToFrontend);
        // Mantenemos solo los que tienen el rol de Jefe de Área ('especialista_bajo')
        const filtered = mapped.filter((esp) => esp.rol === 'especialista_bajo');
        setJefes(filtered);
      } else {
        console.error('Error al cargar los jefes de área desde la API:', res.error);
      }
    } catch (err) {
      console.error('Error de red al cargar jefes de área:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchJefes());
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando jefes de área...</span>
      </div>
    );
  }

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