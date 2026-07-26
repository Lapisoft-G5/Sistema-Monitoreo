import { TrendingDown, ShieldCheck } from 'lucide-react';
import { Card } from '@shared/ui/card';
import type { IUgelDashboardDistritoDeterioro } from '@sistema-monitoreo/shared-contracts';

interface Props {
  items: IUgelDashboardDistritoDeterioro[];
  /** Año consultado (para rotular la comparación con el anterior). */
  anio: number;
}

/** Distritos que empeoraron su promedio respecto al año anterior. */
export const DeterioroDistritosCard = ({ items, anio }: Props) => (
  <Card className="p-5 border-border shadow-xs h-full">
    <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
      <TrendingDown className="w-5 h-5 text-destructive" /> Alertas de deterioro
    </h3>
    <p className="text-xs text-text-muted mb-4">
      Distritos con menor promedio que en {anio - 1}.
    </p>

    {items.length === 0 ? (
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
        <ShieldCheck className="w-8 h-8 text-green-600" />
        <p className="text-sm text-text-muted">Ningún distrito empeoró respecto al año anterior.</p>
      </div>
    ) : (
      <ul className="flex flex-col divide-y divide-border">
        {items.map((d) => (
          <li key={d.distrito} className="py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{d.distrito}</div>
              <div className="text-[11px] text-text-muted">
                {d.promedioPrevio.toFixed(1)} → {d.promedioActual.toFixed(1)}
              </div>
            </div>
            <span className="flex items-center gap-1 text-destructive font-extrabold tabular-nums shrink-0">
              <TrendingDown className="w-4 h-4" />
              {d.delta.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
