import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { DirectorFormBase } from '@features/directores';
import type { DirectorFormData } from '@entities/model-docentes/validator';
import type { DocenteFormData } from '@entities/model-docentes/validator';
import { useDocenteService } from '@features/docentes/docente-service';
import { institutionsApi } from '@shared/api/institutions.api';
import type { IInstitucionResponse } from '@sistema-monitoreo/shared-contracts';

export const CreateDirectorCard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [instituciones, setInstituciones] = useState<IInstitucionResponse[]>([]);
  const [fetching, setFetching] = useState(true);
  const { createDocente, loading: saving, error: serviceError } = useDocenteService();

  useEffect(() => {
    const fetchIes = async () => {
      setFetching(true);
      const res = await institutionsApi.findAll({ limit: 1000 });
      if (res.ok && res.data) {
        setInstituciones(res.data.data);
      }
      setFetching(false);
    };
    fetchIes();
  }, []);

  const handleSubmit = async (data: DirectorFormData) => {
    const ie = instituciones.find((i) => i.id === data.institucionId);
    if (!ie) {
      setError('La institución seleccionada no existe.');
      return;
    }

    const docenteFormData: DocenteFormData = {
      nombres: data.nombres,
      apellidos: data.apellidos,
      dni: data.dni,
      correo: data.correo,
      celular: data.celular,
      nivelEducativo: (ie.nivelEducativo?.toUpperCase() || 'PRIMARIA') as DocenteFormData['nivelEducativo'],
      condicion: data.condicion as DocenteFormData['condicion'],
      especialidad: 'Gestión Escolar',
      cargaHoraria: 40,
      secciones: [],
      escala: data.escala,
      institucionId: data.institucionId,
      activo: true,
      cargo: 'Director',
    };

    const result = await createDocente(docenteFormData);
    if (result.success) {
      navigate('/instituciones/docentes');
    }
  };

  if (fetching) {
    return (
      <div className="w-full h-[30vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando instituciones disponibles...</span>
      </div>
    );
  }

  const finalError = error || serviceError;

  return (
    <Card className="w-full bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
      {finalError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-medium mb-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {finalError}
        </div>
      )}

      <DirectorFormBase
        onSubmit={handleSubmit}
        onCancel={() => navigate('/instituciones/docentes')}
        isLoading={saving}
        instituciones={instituciones.map((i) => ({ id: i.id, nombre: i.nombre }))}
      />
    </Card>
  );
};
