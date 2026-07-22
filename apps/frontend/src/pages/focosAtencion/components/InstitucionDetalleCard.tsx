import { ArrowLeft, UserCog, Users, ClipboardCheck, CalendarClock, Target } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { Spinner } from '@shared/ui/Spinner';
import { useInstitucionDetalle } from '@features/dashboard';

interface Props {
  institucionId: string;
  onBack: () => void;
}

/** Detalle de una IE al hacer clic en su punto del mapa: director, docentes,
 *  monitoreos realizados/programados y cobertura. Se muestra en el panel derecho. */
export const InstitucionDetalleCard = ({ institucionId, onBack }: Props) => {
  const { data, isLoading, isError } = useInstitucionDetalle(institucionId);

  return (
    <Card className="flex flex-col h-full border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Volver a la lista"
          aria-label="Volver a la lista"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-bold truncate">Detalle de la I.E.</h3>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <Spinner />
          <span className="text-text-muted text-sm font-medium">Cargando detalle…</span>
        </div>
      ) : isError || !data ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-danger text-sm font-medium">
          No se pudo cargar el detalle de la institución.
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Encabezado de la IE */}
          <div>
            <div className="font-extrabold text-base leading-tight">{data.nombre}</div>
            <div className="text-[11px] text-text-muted uppercase tracking-wide mt-0.5">
              Cód. {data.codigoModular} · {data.distrito} · {data.nivelEducativo}
            </div>
          </div>

          {/* Director */}
          <div className="flex items-start gap-3 rounded-xl border border-border p-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <UserCog className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Director
              </div>
              <div className="font-semibold text-sm truncate">
                {data.director ?? 'Sin director registrado'}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <Metric
              icon={<Users className="w-4 h-4" />}
              label="Docentes"
              value={data.totalDocentes}
            />
            <Metric
              icon={<Target className="w-4 h-4" />}
              label="Cobertura"
              value={`${data.porcentajeCobertura}%`}
            />
            <Metric
              icon={<ClipboardCheck className="w-4 h-4" />}
              label="Monitoreos realizados"
              value={data.monitoreosRealizados}
            />
            <Metric
              icon={<CalendarClock className="w-4 h-4" />}
              label="Monitoreos programados"
              value={data.monitoreosProgramados}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="rounded-xl border border-border p-3 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-text-muted">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-2xl font-extrabold tracking-tight">{value}</span>
  </div>
);
