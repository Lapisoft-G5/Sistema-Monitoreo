import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const DashboardPage = () => {
  return (
    <PlaceholderPage
      title="Panel de Control"
      description="Esta sección mostrará indicadores clave, estadísticas generales y el resumen ejecutivo del sistema de monitoreo."
      icon={<LayoutDashboard className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
