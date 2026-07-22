import { useState } from 'react';
import { useUgelDashboard } from '@features/dashboard';
import { PageHeader } from '@shared/ui/pageHeader';
import { Spinner } from '@shared/ui/Spinner';
import { LampaMap } from '@/pages/directorUgel/components/LampaMap';
import { RequierenAtencionInstitucionalCard } from './components/RequierenAtencionInstitucionalCard';
import { InstitucionDetalleCard } from './components/InstitucionDetalleCard';
import { normDistrito } from '@/pages/directorUgel/utils/norm-distrito';

/**
 * Vista de "Focos de Atención": reutiliza el mapa georreferencial del dashboard
 * UGEL y muestra las II.EE. con docentes/directivos en nivel crítico (versión
 * detallada por institución), disponible para Jefe de Gestión, Jefe de Área y
 * Especialistas. La data llega escopada por rol.
 */
export const FocosAtencionPage = () => {
  const { data, isLoading, isError, error } = useUgelDashboard();
  const [distrito, setDistrito] = useState<string | null>(null);
  const [institucionSel, setInstitucionSel] = useState<string | null>(null);

  const sel = distrito ? normDistrito(distrito) : null;
  const atencion = sel
    ? (data?.requierenAtencion ?? []).filter((ie) => normDistrito(ie.distrito) === sel)
    : (data?.requierenAtencion ?? []);

  return (
    <div className="flex flex-col gap-6 lg:h-full">
      <PageHeader
        title="Focos de Atención"
        description="Instituciones con docentes o directivos en nivel crítico. Notifica o solicita una visita de acompañamiento prioritaria."
      />

      {isLoading ? (
        <div className="w-full h-[40vh] flex flex-col justify-center items-center gap-3">
          <Spinner />
          <span className="text-text-muted text-sm font-medium">Cargando focos de atención…</span>
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-danger font-medium">
          No se pudo cargar la información: {(error as Error)?.message ?? 'error desconocido'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-1 gap-6 min-h-[440px] lg:min-h-0 lg:flex-1">
          <div className="lg:col-span-2">
            <LampaMap
              coberturaPorDistrito={data?.coberturaPorDistrito ?? []}
              instituciones={data?.institucionesMapa ?? []}
              selected={distrito}
              onSelectDistrito={setDistrito}
              onSelectInstitucion={setInstitucionSel}
              selectedInstitucionId={institucionSel}
            />
          </div>
          <div className="lg:col-span-1">
            {institucionSel ? (
              <InstitucionDetalleCard
                institucionId={institucionSel}
                onBack={() => setInstitucionSel(null)}
              />
            ) : (
              <RequierenAtencionInstitucionalCard items={atencion} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
