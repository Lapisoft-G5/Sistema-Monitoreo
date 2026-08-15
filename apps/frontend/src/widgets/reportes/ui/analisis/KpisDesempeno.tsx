import { Users, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import type { AnalisisDesempenoResultado } from '@/features/reportes/lib/analisis-desempeno';

interface KpisDesempenoProps {
  analisis: AnalisisDesempenoResultado;
}

export const KpisDesempeno = ({ analisis }: KpisDesempenoProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Docentes Monitoreados
          </span>
          <div className="text-xl font-black text-text leading-tight mt-0.5">
            {analisis.totalDocentes}
          </div>
          <span className="text-[10px] text-text-muted font-medium">
            {analisis.totalEvaluaciones} evaluaciones totales
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Promedio General
          </span>
          <div className="text-xl font-black text-text leading-tight mt-0.5">
            {analisis.promedioGeneral.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            Escala vigesimal / Rúbrica
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Logro Satisfactorio +
          </span>
          <div className="text-xl font-black text-indigo-700 leading-tight mt-0.5">
            {analisis.tasaSatisfactoria}%
          </div>
          <span className="text-[10px] text-text-muted font-medium">
            Niveles III y IV (Destacado)
          </span>
        </div>
      </Card>

      <Card className="p-4 border border-border shadow-xs bg-surface flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Foco de Reforzamiento
          </span>
          <div className="text-xl font-black text-amber-700 leading-tight mt-0.5">
            {analisis.totalEnRefuerzo}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">
            {analisis.tasaRefuerzo}% en Nivel I o II
          </span>
        </div>
      </Card>
    </div>
  );
};
