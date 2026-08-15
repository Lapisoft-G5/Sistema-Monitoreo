import { Award, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import type { AnalisisDesempenoCompleto } from '@/features/reportes/lib/analisis-desempeno';

interface KpisCriteriosProps {
  analisis: AnalisisDesempenoCompleto;
}

export const KpisCriterios = ({ analisis }: KpisCriteriosProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Monitoreos Analizados
          </span>
          <div className="text-xl font-black text-text leading-tight mt-0.5">
            {analisis.totalEvaluaciones}
          </div>
          <span className="text-[10px] text-text-muted font-medium">
            Fichas docentes completadas
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Promedio Rúbricas
          </span>
          <div className="text-xl font-black text-indigo-700 leading-tight mt-0.5">
            {analisis.promedioGeneral.toFixed(2)}
          </div>
          <span className="text-[10px] text-indigo-600 font-bold">
            Escala de Rúbrica (1 a 4)
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Mayor Dominio
          </span>
          <div className="text-sm font-black text-emerald-700 leading-tight mt-0.5 truncate">
            {analisis.criterioMayorDominio?.nombre || 'N/A'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {analisis.criterioMayorDominio ? `${analisis.criterioMayorDominio.tasaLogro}% Logro Esperado/Destacado` : '-'}
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Foco Prioritario
          </span>
          <div className="text-sm font-black text-amber-700 leading-tight mt-0.5 truncate">
            {analisis.criterioMayorRefuerzo?.nombre || 'N/A'}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">
            {analisis.criterioMayorRefuerzo ? `${analisis.criterioMayorRefuerzo.tasaRefuerzo}% en Inicio / Proceso` : '-'}
          </span>
        </div>
      </Card>
    </div>
  );
};
