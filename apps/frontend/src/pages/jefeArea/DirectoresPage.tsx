import { useState, useEffect } from 'react';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { FilterDirectores } from '@features/directores';
import { DirectoresStatsWidget, DirectoresTableWidget } from '@widgets/directores';
import { teachersApi } from '@shared/api/teachers.api';
import { institutionsApi } from '@shared/api/institutions.api';
import { mapApiDocenteToFrontend } from '@features/docentes/docente-service';
import { mapApiInstitucionToFrontend } from '@features/institutions/institution-service';
import type { Docente } from '@entities/model-docentes';
import type { Institucion } from '@entities/model-instituciones';

export const DirectoresPage = () => {
  const navigate = useNavigate();
  const [directores, setDirectores] = useState<Docente[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [teachersRes, instsRes] = await Promise.all([
        teachersApi.findAll(),
        institutionsApi.findAll({ limit: 1000 }),
      ]);

      if (teachersRes.ok && teachersRes.data) {
        setDirectores(teachersRes.data.map(mapApiDocenteToFrontend));
      } else {
        console.error('Error loading teachers:', teachersRes.error);
      }

      if (instsRes.ok && instsRes.data) {
        setInstituciones(instsRes.data.data.map(mapApiInstitucionToFrontend));
      } else {
        console.error('Error loading institutions:', instsRes.error);
      }
    } catch (err) {
      console.error('Connection error loading directores data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchAllData());
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando directores...</span>
      </div>
    );
  }

  // Solo los directores (cargo Director o Coordinador Pedagógico) para los indicadores.
  const soloDirectores = directores.filter(
    (d) => d.cargo === 'Director' || d.cargo === 'Coordinador Pedagógico',
  );

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

      {/* 1. Indicadores */}
      <DirectoresStatsWidget directores={soloDirectores} />

      {/* 2. Barra de filtros (controlada por la URL) */}
      <FilterDirectores />

      {/* 3. Tabla de directores */}
      <DirectoresTableWidget
        directores={directores}
        setDirectores={setDirectores}
        instituciones={instituciones}
        onView={(dir) => navigate(`/instituciones/docentes/${dir.id}`)}
        onEdit={(dir) => navigate(`/instituciones/docentes/${dir.id}/editar`)}
      />
    </div>
  );
};
