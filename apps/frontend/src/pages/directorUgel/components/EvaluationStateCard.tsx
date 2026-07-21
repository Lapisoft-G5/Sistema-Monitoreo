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
    <Badge variant={badgeVariant} className="uppercase font-bold tracking-wider text-[10px]">
      {badgeLabel}
    </Badge>
  </Card>
);

export interface EvaluationStateData {
  /** Docentes/IEs en situación crítica (nivel INICIO). */
  critico: number;
  /** En seguimiento (nivel EN_PROCESO). */
  enProceso: number;
  /** Logro previsto (LOGRO_ESPERADO + LOGRO_DESTACADO). */
  logroPrevisto: number;
  /** Cobertura actual de monitoreo, en porcentaje (0 a 100). */
  coberturaActual?: number;
  /** Meta de cobertura, en porcentaje (por defecto 100). */
  meta?: number;
}

// Valores por defecto (dashboard UGEL, aún sin datos reales conectados).
const DEFAULT_DATA: EvaluationStateData = {
  critico: 15,
  enProceso: 45,
  logroPrevisto: 60,
  coberturaActual: 23.8,
  meta: 100,
};

const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

export const EvaluationStateCard = ({ data }: { data?: EvaluationStateData }) => {
  const { critico, enProceso, logroPrevisto, coberturaActual, meta } = data ?? DEFAULT_DATA;
  const total = critico + enProceso + logroPrevisto;

  return (
    <div className="flex flex-col h-full bg-transparent">
      <h3 className="text-lg font-bold mb-4">Estado de Evaluación</h3>

      <StateItem
        icon={<AlertCircle className="w-5 h-5" />}
        count={critico}
        label="Situación Crítica"
        badgeLabel="Rojo"
        badgeVariant="destructive"
        iconColorClass="text-destructive bg-destructive/10"
      />

      <StateItem
        icon={<AlertTriangle className="w-5 h-5" />}
        count={enProceso}
        label="En seguimiento"
        badgeLabel="Naranja"
        badgeVariant="warning"
        iconColorClass="text-amber-500 bg-amber-500/10"
      />

      <StateItem
        icon={<CheckCircle2 className="w-5 h-5" />}
        count={logroPrevisto}
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
          <div className="h-full bg-green-500" style={{ width: `${pct(logroPrevisto, total)}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${pct(enProceso, total)}%` }} />
          <div className="h-full bg-destructive" style={{ width: `${pct(critico, total)}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-text-muted font-semibold">
          <span>META: {meta ?? 100}%</span>
          <span>ACTUAL: {(coberturaActual ?? 0).toFixed(1)}%</span>
        </div>
      </Card>
    </div>
  );
};
