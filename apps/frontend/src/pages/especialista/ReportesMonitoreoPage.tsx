import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const ReportesMonitoreoPage = () => {
  return (
    <PlaceholderPage
      title="Reportes de Monitoreo"
      description="Espacio reservado para que el especialista consulte los reportes y estadísticas del avance pedagógico."
      icon={<BarChart3 className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
