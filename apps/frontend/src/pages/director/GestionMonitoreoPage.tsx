import { Compass } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const GestionMonitoreoPage = () => {
  return (
    <PlaceholderPage
      title="Gestión de Monitoreo"
      description="Esta sección permite realizar el seguimiento y ejecución de las fichas de monitoreo docente."
      icon={<Compass className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
