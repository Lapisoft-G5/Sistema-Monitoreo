import { useState } from 'react';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import type { IUgelDashboardDistritoCritico } from '@sistema-monitoreo/shared-contracts';
import { NotificarDistritoDialog } from '@features/notifications';

interface RequierenAtencionCardProps {
  items: IUgelDashboardDistritoCritico[];
}

export const RequierenAtencionCard = ({ items }: RequierenAtencionCardProps) => {
  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <Card className="flex flex-col h-full border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-bold">Requieren atención</h3>
        {items.length > 0 && (
          <Badge variant="destructive" className="ml-auto font-bold">
            {items.length}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <p className="text-sm text-text-muted">Ningún distrito en nivel crítico. Buen trabajo.</p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-y-auto">
          {items.map((d) => {
            const abierto = expandido === d.distrito;
            return (
              <div key={d.distrito} className="px-4 py-3">
                {/* Encabezado del distrito */}
                <button
                  type="button"
                  onClick={() => setExpandido(abierto ? null : d.distrito)}
                  className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold truncate">{d.distrito}</div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wide">
                        {d.institucionesCriticas.length} II.EE. crítica
                        {d.institucionesCriticas.length === 1 ? '' : 's'} · {d.totalInstituciones}{' '}
                        monitoreada{d.totalInstituciones === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-destructive tabular-nums shrink-0">
                    {d.promedio.toFixed(1)}
                  </span>
                </button>

                {/* Desglose de II.EE. críticas */}
                {abierto && d.institucionesCriticas.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {d.institucionesCriticas.map((ie) => (
                      <li
                        key={ie.institucionId}
                        className="rounded-lg bg-destructive/5 px-3 py-2 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{ie.nombre}</div>
                          <div className="text-[10px] text-text-muted uppercase tracking-wide">
                            {ie.nivelEducativo}
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-destructive tabular-nums shrink-0">
                          {ie.promedio.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Acción a nivel distrito */}
                <div className="mt-2 pl-6">
                  <NotificarDistritoDialog distrito={d.distrito} promedio={d.promedio} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
