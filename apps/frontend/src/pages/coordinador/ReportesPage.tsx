import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '@shared/ui/PlaceholderPage';

export const ReportesPage = () => {
  return (
    <PlaceholderPage
      title="Bandeja de Reportes"
      description="Esta sección permite visualizar reportes consolidados y estadísticas del avance de monitoreo."
      icon={<BarChart3 className="h-[38px] w-[38px]" strokeWidth={1.5} />}
    />
  );
};
