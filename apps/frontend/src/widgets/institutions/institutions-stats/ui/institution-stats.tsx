import { Book, UserCheck, UserX } from 'lucide-react';
import type { Institucion } from '@entities/model-instituciones';
import { EntityStats } from '@shared/ui/EntityStats';

interface Props {
  instituciones: Institucion[];
}

export const InstitutionsStatsWidget = ({ instituciones }: Props) => {
  const total = instituciones.length || 1;
  const conDirector = instituciones.filter((i) => i.director !== null).length;
  const sinDirector = instituciones.filter((i) => i.director === null).length;
  const porcentaje = Math.round((conDirector / total) * 100);

  return (
    <EntityStats
      columns={3}
      cards={[
        {
          title: 'Total II.EE.',
          icon: <Book className="w-5 h-5 text-primary" strokeWidth={2} />,
          value: instituciones.length,
          trendText: 'Jurisdicción UGEL Lampa',
          trendType: 'success',
        },
        {
          title: 'Directores Asignados',
          icon: <UserCheck className="w-5 h-5 text-green-500" strokeWidth={2} />,
          value: conDirector,
          progressValue: porcentaje,
          trendText: `${porcentaje}% de cobertura directiva`,
        },
        {
          title: 'II.EE. sin Director',
          icon: <UserX className="w-5 h-5 text-rose-500" strokeWidth={2} />,
          value: sinDirector,
          trendText: sinDirector > 0 ? `${sinDirector} plazas por asignar` : 'Plazas 100% cubiertas',
          trendType: sinDirector > 0 ? 'danger' : 'success',
        },
      ]}
    />
  );
};
