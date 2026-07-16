import { Card } from '@shared/ui/card';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@shared/ui/badge';

interface StateItemProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  badgeLabel: string;
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning';
  iconColorClass: string;
}

const StateItem = ({ icon, count, label, badgeLabel, badgeVariant = 'default', iconColorClass }: StateItemProps) => (
  <Card className="flex items-center justify-between p-4 shadow-sm border-border mb-3 last:mb-0">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-full bg-muted ${iconColorClass}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold">{count}</div>
        <div className="text-sm text-text-muted">{label}</div>
      </div>
    </div>
    <Badge variant={badgeVariant as any} className="uppercase font-bold tracking-wider text-[10px]">
      {badgeLabel}
    </Badge>
  </Card>
);

export const EvaluationStateCard = () => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <h3 className="text-lg font-bold mb-4">Estado de Evaluación</h3>
      
      <StateItem 
        icon={<AlertCircle className="w-5 h-5" />}
        count={15}
        label="Situación Crítica"
        badgeLabel="Rojo"
        badgeVariant="destructive"
        iconColorClass="text-destructive bg-destructive/10"
      />
      
      <StateItem 
        icon={<AlertTriangle className="w-5 h-5" />}
        count={45}
        label="En seguimiento"
        badgeLabel="Naranja"
        badgeVariant="warning"
        iconColorClass="text-amber-500 bg-amber-500/10"
      />
      
      <StateItem 
        icon={<CheckCircle2 className="w-5 h-5" />}
        count={60}
        label="Logro Previsto"
        badgeLabel="Verde"
        badgeVariant="success"
        iconColorClass="text-green-600 bg-green-500/10"
      />

      <Card className="mt-auto p-4 bg-muted/30 border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-text-muted">Resumen de Cobertura</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: '60%' }} />
          <div className="h-full bg-amber-500" style={{ width: '25%' }} />
          <div className="h-full bg-destructive" style={{ width: '15%' }} />
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-text-muted font-semibold">
          <span>META 2024: 100%</span>
          <span>ACTUAL: 23.8%</span>
        </div>
      </Card>
    </div>
  );
};
