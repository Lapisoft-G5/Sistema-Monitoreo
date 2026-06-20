import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { useNavigate } from 'react-router-dom';

import { FilterDocentes } from '@features/docentes';
import { DocentesStatsWidget, DocentesTableWidget } from '@widgets/docentes';
import { teachersApi } from '@shared/api/teachers.api';
import { mapApiDocenteToFrontend } from '@features/docentes/docente-service';
import type { Docente } from '@entities/model-docentes';
import type { Institucion } from '@entities/model-instituciones';
import { useUser } from '@entities/model-user';

export const DocentesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const teachersRes = await teachersApi.findAll();

      if (teachersRes.ok && teachersRes.data) {
        let mapped = teachersRes.data.map(mapApiDocenteToFrontend);
        const isDirectorIe = user?.role === 'director_institucion' || user?.role === 'director_ie';
        if (isDirectorIe) {
          mapped = mapped.filter((d) => d.cargo !== 'Director');
        }
        setDocentes(mapped);
      } else {
        console.error('Error loading teachers:', teachersRes.error);
      }

      if (user?.institucion && user?.institucionNombre) {
        setInstituciones([
          {
            id: user.institucion,
            nombre: user.institucionNombre,
            codigoModular: '',
            codigoLocal: '',
            direccion: '',
            nivel: user.institucionNivel || 'Primaria',
            distrito: user.distrito || '',
            provincia: '',
            zona: '',
            modalidad: 'EBR',
            director: `${user.apellidos}, ${user.nombres}`,
            activo: true,
            estado: 'Activa',
          },
        ]);
      }
    } catch (err) {
      console.error('Connection error loading docentes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchAllData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando docentes...</span>
      </div>
    );
  }

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
      <DocentesStatsWidget docentes={docentes} />

      {/* 2. Barra de Filtros */}
      <FilterDocentes docentes={docentes} />

      {/* 3. Tabla de Datos */}
      <DocentesTableWidget
        docentes={docentes}
        setDocentes={setDocentes}
        instituciones={instituciones}
        targetCargo="Docente de Aula"
        itemName="docentes"
        routePrefix="/instituciones/docentes"
        onView={(doc) => navigate(`/instituciones/docentes/${doc.id}`)}
      />
    </div>
  );
};
