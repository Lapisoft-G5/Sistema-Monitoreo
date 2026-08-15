import { Award, AlertTriangle, TrendingUp, BookOpen, ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import type { AnalisisDesempenoCompleto } from '@/features/reportes/lib/analisis-desempeno';

interface KpisCriteriosProps {
  analisis: AnalisisDesempenoCompleto;
}

export const KpisCriterios = ({ analisis }: KpisCriteriosProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* KPI 1: Monitoreos analizados */}
      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow min-w-0">
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">
            Monitoreos Analizados
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {analisis.totalEvaluaciones}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1 truncate">
            fichas docentes completadas
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      {/* KPI 2: Promedio Rúbricas */}
      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow min-w-0">
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">
            Promedio Rúbricas
          </span>
          <span className="text-xl font-black text-slate-800 block mt-0.5 leading-none">
            {analisis.promedioGeneral.toFixed(2)}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-1 truncate">
            escala de rúbrica (1 a 4)
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      {/* KPI 3: Mayor Dominio */}
      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow min-w-0">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">
            Mayor Dominio
          </span>
          <span className="text-xl font-black text-emerald-700 block mt-0.5 leading-none">
            {analisis.criterioMayorDominio ? `${analisis.criterioMayorDominio.tasaLogro}%` : '—'}
          </span>
          <span
            className="text-[10px] text-slate-400 font-semibold block mt-1 truncate"
            title={analisis.criterioMayorDominio ? `Criterio ${analisis.criterioMayorDominio.orden}: ${analisis.criterioMayorDominio.nombre}` : undefined}
          >
            {analisis.criterioMayorDominio
              ? `Criterio ${analisis.criterioMayorDominio.orden}: ${analisis.criterioMayorDominio.nombre}`
              : 'Sin evaluaciones'}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>

      {/* KPI 4: Foco Prioritario */}
      <Card className="p-4 border border-border bg-surface flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow transition-shadow min-w-0">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">
            Foco Prioritario
          </span>
          <span className="text-xl font-black text-amber-700 block mt-0.5 leading-none">
            {analisis.criterioMayorRefuerzo ? `${analisis.criterioMayorRefuerzo.tasaRefuerzo}%` : '—'}
          </span>
          <span
            className="text-[10px] text-slate-400 font-semibold block mt-1 truncate"
            title={analisis.criterioMayorRefuerzo ? `Criterio ${analisis.criterioMayorRefuerzo.orden}: ${analisis.criterioMayorRefuerzo.nombre}` : undefined}
          >
            {analisis.criterioMayorRefuerzo
              ? `Criterio ${analisis.criterioMayorRefuerzo.orden}: ${analisis.criterioMayorRefuerzo.nombre}`
              : 'Sin evaluaciones'}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </Card>
    </div>
  );
};
