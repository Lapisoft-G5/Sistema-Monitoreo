import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@entities/model-user'; // 🚀 Tu entidad de usuario limpia
import type { Institucion } from '@entities/model-instituciones';
import { institutionsApi } from '@shared/api/institutions.api';
import { mapApiInstitucionToFrontend } from '@features/institutions/institution-service';

import { InstitutionProfileWidget } from '@widgets/institutions/ViewInstitution';

export const InstitutionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useUser();

  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [loading, setLoading] = useState(true);

  const isReadOnly = user?.role === 'especialista';

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await institutionsApi.findById(id);
        if (res.ok && res.data) {
          setInstitucion(mapApiInstitucionToFrontend(res.data));
        } else {
          setInstitucion(null);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setInstitucion(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Cargando datos de la I.E...</span>
      </div>
    );
  }

  if (!institucion) {
    return (
      <div className="w-full max-w-[820px] mx-auto text-center py-20 bg-surface border border-border rounded-2xl shadow-sm mt-6">
        <h2 className="text-xl font-bold text-text mb-2">Institución no encontrada</h2>
        <p className="text-text-muted mb-6">
          El código identificador {id} no existe o no tiene permisos de acceso.
        </p>
        <button
          onClick={() => navigate('/instituciones/padron')}
          className="px-5 py-2.5 bg-bg border border-border rounded-xl font-semibold text-text hover:bg-muted transition-colors cursor-pointer"
        >
          Volver al Padrón
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto w-full">
      <InstitutionProfileWidget
        institucion={institucion}
        isReadOnly={isReadOnly}
        onBack={() => navigate('/instituciones/padron')}
        onEdit={() => navigate(`/instituciones/${id}/editar`)}
      />
    </div>
  );
};
