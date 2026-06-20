import { Compass } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const CalendarioPage = () => {
  return (
    <PlaceholderPage
      title="Calendario de Monitoreo"
      description="Esta sección permite visualizar el calendario de visitas y actividades de monitoreo."
      icon={<Compass className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
