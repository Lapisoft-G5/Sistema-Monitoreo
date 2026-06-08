import { Users, GraduationCap, ShieldAlert } from 'lucide-react';
import type { Docente } from '@entities/model-docentes';
import { StatCard } from '@shared/ui/Stat-Card';
import { useUser } from '@entities/model-user';

interface Props {
  docentes: Docente[];
}

export const DocentesStatsWidget = ({ docentes }: Props) => {
  const { user } = useUser();
  const isDirectorIe = user?.role === 'director_institucion';

  const total = docentes.length || 1;
  const nombrados = docentes.filter((d) => d.condicion === 'Nombrado').length;
  const contratados = docentes.filter((d) => d.condicion === 'Contratado').length;
  const porcentajeNombrados = Math.round((nombrados / total) * 100);

  if (isDirectorIe) {
    const activos = docentes.filter((d) => d.activo).length;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in-0 duration-300">
        <StatCard
          title="Total de Docentes"
          icon={<Users className="w-5 h-5 text-primary" strokeWidth={2} />}
          value={docentes.length}
          progressValue={Math.round((activos / total) * 100)}
          trendText={`${activos} Activos / ${docentes.length - activos} Inactivos`}
        />
        <StatCard
          title="Docentes Nombrados"
          icon={<GraduationCap className="w-5 h-5 text-green-500" strokeWidth={2} />}
          value={nombrados}
          progressValue={porcentajeNombrados}
          trendText={`${porcentajeNombrados}% con estabilidad laboral`}
        />
        <StatCard
          title="Docentes Contratados"
          icon={<ShieldAlert className="w-5 h-5 text-amber-500" strokeWidth={2} />}
          value={contratados}
          trendText="Contratos temporales vigentes"
          trendType="warning"
        />
      </div>
    );
  }

  const directores = docentes.filter((d) => d.cargo === 'Director').length;
  const coordinadores = docentes.filter((d) => d.cargo === 'Coordinador Pedagógico').length;
  const directivosTotal = directores + coordinadores;

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
