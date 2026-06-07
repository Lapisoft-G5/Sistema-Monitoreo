import { Users } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const EspecialistasPage = () => {
  return (
    <PlaceholderPage
      title="Gestión de Especialistas"
      description="Esta sección permite administrar el padrón oficial de especialistas de monitoreo de la jurisdicción."
      icon={<Users className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
