import { Compass } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const PlanMonitoreoAnualPage = () => {
  return (
    <PlaceholderPage
      title="Plan de Monitoreo Anual"
      description="Esta sección permite planificar y estructurar el plan anual de monitoreo de la UGEL."
      icon={<Compass className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
