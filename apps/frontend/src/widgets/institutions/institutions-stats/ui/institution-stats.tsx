import { Book, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Institucion } from '@entities/model-instituciones'; // Ajusta la ruta a tu entidad limpia
import { StatCard } from '@shared/ui/Stat-Card';

interface Props {
  instituciones: Institucion[];
}

export const InstitutionsStatsWidget = ({ instituciones }: Props) => {
  const total = instituciones.length || 1; // Evitar división por cero
  const monitoreadas = instituciones.filter((i) => i.estado === 'Satisfactorio').length;
  const criticas = instituciones.filter((i) => i.estado !== 'Satisfactorio').length;
  
  const porcentaje = Math.round((monitoreadas / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard 
        title="Total II.EE." 
        icon={<Book className="w-5 h-5 text-primary" strokeWidth={2} />}
        value={instituciones.length}
        trendText="↗ +2 este mes"
        trendType="success"
      />
      <StatCard 
        title="Monitoreadas" 
        icon={<CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={2} />}
        value={monitoreadas}
        progressValue={porcentaje}
        trendText={`${porcentaje}% del total general`}
      />
      <StatCard 
        title="Críticas / En Proceso" 
        icon={<AlertCircle className="w-5 h-5 text-amber-500" strokeWidth={2} />}
        value={criticas}
        trendText="! Requieren atención"
        trendType="danger"
      />
    </div>
  );
};