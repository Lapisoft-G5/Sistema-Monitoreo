import { Users, BadgeCheck, UserCog, Clock } from 'lucide-react';
import type { Docente } from '@entities/model-docentes';
import { StatCard } from '@shared/ui/Stat-Card';

interface Props {
  directores: Docente[];
}

export const DirectoresStatsWidget = ({ directores }: Props) => {
  const total = directores.length;
  const asignados = directores.filter((d) => d.condicion === 'Asignado').length;
  const encargados = directores.filter((d) => d.condicion === 'Encargado').length;

  const ultimo = directores.length
    ? [...directores].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))[0]
    : null;
  const ultimoLabel = ultimo
    ? (() => {
        // Parsear como fecha local (evita el corrimiento de zona horaria de 'YYYY-MM-DD').
        const [y, m, d] = ultimo.fechaCreacion.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      })()
    : '—';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Directores"
        icon={<Users className="w-5 h-5 text-primary" strokeWidth={2} />}
        value={total}
        trendText={`${total} registrados en el padrón`}
      />
      <StatCard
        title="Asignados"
        icon={<BadgeCheck className="w-5 h-5 text-green-500" strokeWidth={2} />}
        value={asignados}
        trendText="Con plaza asignada"
        trendType="success"
      />
      <StatCard
        title="Encargados"
        icon={<UserCog className="w-5 h-5 text-amber-500" strokeWidth={2} />}
        value={encargados}
        trendText="Encargatura vigente"
        trendType="warning"
      />
      <StatCard
        title="Último Registro"
        icon={<Clock className="w-5 h-5 text-primary" strokeWidth={2} />}
        value={ultimoLabel}
        trendText="Fecha de alta más reciente"
      />
    </div>
  );
};
