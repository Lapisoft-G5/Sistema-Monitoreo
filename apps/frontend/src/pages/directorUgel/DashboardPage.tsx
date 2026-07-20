import { useState } from 'react';
import { Target, BarChart4, AlertCircle, Building2 } from 'lucide-react';
import { useUgelDashboard, nivelLogroUi, iniciales } from '@features/dashboard';
import { KpiStat } from './components/KpiStat';
import { LampaMap, normDistrito } from './components/LampaMap';
import { RequierenAtencionCard } from './components/RequierenAtencionCard';
import { CoberturaDistritoCard } from './components/CoberturaDistritoCard';
import { SemaforoDonutCard } from './components/SemaforoDonutCard';
import { RecentMonitoringsTable, type MonitoringRow } from './components/RecentMonitoringsTable';

/** Umbral de nivel aceptable (inicio de LOGRO_ESPERADO en el baremo). */
const META_NIVEL = 2.6;
/** Meta de cobertura de monitoreo. */
const META_COBERTURA = 100;

export const DashboardPage = () => {
  const { data, isLoading, isError, error } = useUgelDashboard();
  const [distrito, setDistrito] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        Cargando dashboard…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        No se pudo cargar el dashboard: {(error as Error)?.message ?? 'error desconocido'}
      </div>
    );
  }

  const kpis = data?.kpis;
  const semaforo = data?.semaforo;
  const cobertura = kpis?.porcentajeCobertura ?? 0;
  const nivelPromedio = kpis?.nivelPromedio ?? 0;
  const bajoMeta = nivelPromedio > 0 && nivelPromedio < META_NIVEL;
  const criticas = semaforo?.critico ?? 0;
  const faltante = Math.max(META_COBERTURA - cobertura, 0);

  const sel = distrito ? normDistrito(distrito) : null;
  const enDistrito = <T extends { distrito: string }>(arr: T[]) =>
    sel ? arr.filter((x) => normDistrito(x.distrito) === sel) : arr;

  const atencion = enDistrito(data?.requierenAtencion ?? []);
  const recientes: MonitoringRow[] = enDistrito(data?.monitoreosRecientes ?? []).map((m) => {
    const ui = nivelLogroUi(m.nivelLogro);
    return {
      id: m.fichaId,
      school: m.institucionNombre,
      codModular: m.institucionCodigoModular,
      level: m.nivelEducativo,
      district: m.distrito,
      specialist: m.especialistaNombre,
      specialistInitials: iniciales(m.especialistaNombre),
      date: new Date(m.fecha).toLocaleDateString('es-PE'),
      status: ui.label,
      score: Number(m.promedio.toFixed(1)),
      statusVariant: ui.variant,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Strip de KPIs compacto */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStat
          label="Cobertura"
          icon={<Target className="w-5 h-5" />}
          value={`${cobertura}%`}
          sub={`meta ${META_COBERTURA}% · faltan ${faltante}%`}
          tone={cobertura >= 75 ? 'success' : cobertura >= 40 ? 'warning' : 'danger'}
        />
        <KpiStat
          label="Nivel promedio"
          icon={<BarChart4 className="w-5 h-5" />}
          value={`${nivelPromedio.toFixed(1)} / 4.0`}
          sub={bajoMeta ? `bajo la meta (${META_NIVEL})` : `en meta (${META_NIVEL})`}
          tone={bajoMeta ? 'danger' : 'success'}
        />
        <KpiStat
          label="II.EE. críticas"
          icon={<AlertCircle className="w-5 h-5" />}
          value={criticas}
          sub={criticas > 0 ? 'requieren intervención' : 'sin críticas'}
          tone={criticas > 0 ? 'danger' : 'success'}
        />
        <KpiStat
          label="Total II.EE."
          icon={<Building2 className="w-5 h-5" />}
          value={kpis?.totalInstituciones ?? 0}
          sub={`${kpis?.monitoreadas ?? 0} monitoreadas`}
          tone="neutral"
        />
      </div>

      {/* Mapa coroplético (protagonista) + lista de atención */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[440px]">
        <div className="lg:col-span-2">
          <LampaMap
            coberturaPorDistrito={data?.coberturaPorDistrito ?? []}
            selected={distrito}
            onSelectDistrito={setDistrito}
          />
        </div>
        <div className="lg:col-span-1">
          <RequierenAtencionCard items={atencion} />
        </div>
      </div>

      {/* Ranking por distrito + distribución del semáforo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CoberturaDistritoCard
            items={data?.coberturaPorDistrito ?? []}
            selected={distrito}
            onSelect={setDistrito}
          />
        </div>
        <div className="lg:col-span-1">{semaforo && <SemaforoDonutCard semaforo={semaforo} />}</div>
      </div>

      {/* Monitoreos recientes */}
      <RecentMonitoringsTable
        rows={recientes}
        emptyLabel={
          distrito ? `Sin monitoreos recientes en ${distrito}.` : 'Sin monitoreos registrados.'
        }
      />
    </div>
  );
};
