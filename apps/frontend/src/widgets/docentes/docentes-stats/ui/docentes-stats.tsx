import { Users, GraduationCap, ShieldAlert } from 'lucide-react';
import type { Docente } from '@entities/model-docentes';
import { StatCard } from '@shared/ui/Stat-Card';

interface Props {
  docentes: Docente[];
}

export const DocentesStatsWidget = ({ docentes }: Props) => {
  const total = docentes.length || 1;
  const directores = docentes.filter((d) => d.cargo === 'Director').length;
  const coordinadores = docentes.filter((d) => d.cargo === 'Coordinador Pedagógico').length;
  const directivosTotal = directores + coordinadores;

  const nombrados = docentes.filter((d) => d.condicion === 'Nombrado').length;
  const contratados = docentes.filter((d) => d.condicion === 'Contratado').length;
  const porcentajeNombrados = Math.round((nombrados / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        title="Total de Personal"
        icon={<Users className="w-5 h-5 text-primary" strokeWidth={2} />}
        value={docentes.length}
        progressValue={porcentajeNombrados}
        trendText={`${nombrados} Nombrados / ${contratados} Contratados`}
      />
      <StatCard
        title="Personal Directivo"
        icon={<GraduationCap className="w-5 h-5 text-green-500" strokeWidth={2} />}
        value={directivosTotal}
        progressValue={Math.round((directivosTotal / total) * 100)}
        trendText={`${directores} Directores / ${coordinadores} Coor.`}
      />
      <StatCard
        title="Contratados en Espera / Otros"
        icon={<ShieldAlert className="w-5 h-5 text-amber-500" strokeWidth={2} />}
        value={contratados}
        trendText="Requieren renovación oportuna"
        trendType="warning"
      />
    </div>
  );
};
