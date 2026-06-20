import { Compass } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const CronogramaPage = () => {
  return (
    <PlaceholderPage
      title="Cronograma de Monitoreo"
      description="Esta sección permite planificar y visualizar los cronogramas de monitoreo."
      icon={<Compass className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
