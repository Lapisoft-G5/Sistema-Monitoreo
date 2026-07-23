import { ArrowLeft, UserCog, Users, ClipboardCheck, CalendarClock, Target } from 'lucide-react';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Spinner } from '@shared/ui/Spinner';
import { useInstitucionDetalle } from '@features/dashboard';
import type { NivelLogro } from '@sistema-monitoreo/shared-contracts';

interface Props {
  institucionId: string;
  onBack: () => void;
}

/** Color del promedio según la banda del nivel de logro. */
const colorNivelLogro = (nivel: NivelLogro): string => {
  if (nivel === 'INICIO') return 'text-destructive';
  if (nivel === 'EN_PROCESO') return 'text-amber-500';
  return 'text-green-600';
};

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

          {/* Docentes monitoreados en esta IE (escopado por rol; el especialista
              ve solo los que él monitoreó), con su especialidad. */}
          {data.docentesMonitoreados.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Docentes monitoreados ({data.docentesMonitoreados.length})
              </div>
              <ul className="flex flex-col gap-2">
                {data.docentesMonitoreados.map((d) => (
                  <li
                    key={d.docenteId}
                    className="rounded-lg border border-border px-3 py-2 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{d.nombre}</span>
                        <Badge variant="outline" className="text-[9px] uppercase shrink-0">
                          {d.cargo}
                        </Badge>
                        {d.especialidad && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] uppercase shrink-0 font-semibold"
                          >
                            {d.especialidad}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-lg font-extrabold tabular-nums leading-none shrink-0 ${colorNivelLogro(
                        d.nivelLogro,
                      )}`}
                    >
                      {d.promedio.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
