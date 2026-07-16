import { Card } from '@shared/ui/card';
import { Trophy } from 'lucide-react';
import { Button } from '@shared/ui/button';

const ProgressBar = ({ label, percentage, colorClass }: { label: string; percentage: number; colorClass: string }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end">
        <span className="text-xs font-semibold text-text">{label}</span>
        <span className="text-xs font-bold text-text">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export const RankingEspecialidadCard = () => {
  return (
    <Card className="p-6 h-full flex flex-col gap-6 border-border shadow-xs bg-card">
      <div className="flex items-center gap-3">
        <div className="text-text-muted">
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-text">Ranking por Especialidad</h3>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        <ProgressBar label="Ciencias y Tecnología" percentage={88} colorClass="bg-blue-900" />
        <ProgressBar label="Arte y Cultura" percentage={76} colorClass="bg-slate-700" />
        <ProgressBar label="Comunicación" percentage={62} colorClass="bg-slate-500" />
      </div>

      <Button variant="outline" className="w-full text-xs font-bold border-border">
        Ver reporte detallado
      </Button>
    </Card>
  );
};
