import { Compass } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const PlanMonitoreoPage = () => {
  return (
    <PlaceholderPage
      title="Plan de Monitoreo"
      description="Esta sección permite planificar y estructurar las fichas, criterios y cronogramas de monitoreo de la UGEL."
      icon={<Compass className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
