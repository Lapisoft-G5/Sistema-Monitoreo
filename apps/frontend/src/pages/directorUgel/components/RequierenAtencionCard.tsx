import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { IUgelDashboardCriticaIe } from '@sistema-monitoreo/shared-contracts';
import { NotificarInstitucionDialog } from '@features/notifications';
import { SolicitarVisitaButton } from '@features/visit-requests';

interface RequierenAtencionCardProps {
  items: IUgelDashboardCriticaIe[];
  /** Cuántas mostrar antes del enlace "ver todas". */
  limite?: number;
}

export const RequierenAtencionCard = ({ items, limite = 5 }: RequierenAtencionCardProps) => {
  const visibles = items.slice(0, limite);
  const restantes = items.length - visibles.length;

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
          <p className="text-sm text-text-muted">
            Ninguna institución en estado crítico. Buen trabajo.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visibles.map((ie) => (
            <li key={ie.institucionId} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{ie.nombre}</div>
                <div className="text-xs text-text-muted uppercase tracking-wide">
                  {ie.distrito} · {ie.nivelEducativo}
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <NotificarInstitucionDialog
                    institucionId={ie.institucionId}
                    institucionNombre={ie.nombre}
                  />
                  <SolicitarVisitaButton
                    institucionId={ie.institucionId}
                    institucionNombre={ie.nombre}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-extrabold text-destructive tabular-nums">
                  {ie.promedio.toFixed(1)}
                </span>
                <Badge variant="destructive" className="uppercase text-[10px] font-bold tracking-wider">
                  Crítico
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}

      {restantes > 0 && (
        <div className="mt-auto p-3 border-t border-border">
          <span className="text-sm font-semibold text-primary cursor-pointer hover:underline flex items-center justify-center gap-1">
            Ver las {items.length} críticas <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      )}
    </Card>
  );
};
