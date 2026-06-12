import { Users, ShieldCheck, UserCheck } from 'lucide-react';
import type { Especialista } from '@entities/model-especialistas';
import { StatCard } from '@shared/ui/Stat-Card';

interface Props {
  especialistas: Especialista[];
}

export const EspecialistasStatsWidget = ({ especialistas }: Props) => {
  const total = especialistas.length || 1;
  const activos = especialistas.filter((e) => e.activo).length;
  const inactivos = especialistas.filter((e) => !e.activo).length;
  const adminCount = especialistas.filter((e) => e.rolCode === 'jefe_gestion').length;
  const nivelAreaCount = especialistas.filter((e) => e.rolCode !== 'jefe_gestion').length;

  const porcentajeActivos = Math.round((activos / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        title="Total de Especialistas"
        icon={<Users className="w-5 h-5 text-primary" strokeWidth={2} />}
        value={especialistas.length}
        progressValue={porcentajeActivos}
        trendText={`${activos} Activos / ${inactivos} Inactivos`}
      />
      <StatCard
        title="Especialistas Generales"
        icon={<ShieldCheck className="w-5 h-5 text-green-500" strokeWidth={2} />}
        value={adminCount}
        progressValue={Math.round((adminCount / total) * 100)}
        trendText="Coordinación general de UGEL"
      />
      <StatCard
        title="Especialistas Nivel / Área"
        icon={<UserCheck className="w-5 h-5 text-blue-500" strokeWidth={2} />}
        value={nivelAreaCount}
        progressValue={Math.round((nivelAreaCount / total) * 100)}
        trendText="Acompañamiento en territorio"
      />
    </div>
  );
};
