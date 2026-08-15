import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { AnalisisDesempenoResultado } from '@/features/reportes/lib/analisis-desempeno';

interface GraficoDistribucionNivelProps {
  analisis: AnalisisDesempenoResultado;
}

export const GraficoDistribucionNivel = ({ analisis }: GraficoDistribucionNivelProps) => {
  const chartData = analisis.distribucionArray.map((item) => ({
    name: item.nombre,
    docentes: item.conteo,
    porcentaje: item.porcentaje,
    color: item.color,
    descripcion: item.descripcion,
  }));

  return (
    <Card className="p-5 border border-border shadow-xs bg-surface flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-text">Distribución por Nivel de Logro</h3>
          <Badge variant="outline" className="text-[10px] font-bold">
            {analisis.totalEvaluaciones} Evaluaciones
          </Badge>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Proporción de docentes según su calificación en las rúbricas pedagógicas.
        </p>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e2e8f0)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-lg border border-border shadow-md text-xs">
                        <div className="font-bold text-slate-800">{data.name}</div>
                        <div className="text-[11px] text-slate-500">{data.descripcion}</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-slate-600">Docentes:</span>
                          <span className="font-bold text-slate-900">
                            {data.docentes} ({data.porcentaje}%)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="docentes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-border mt-3">
        {analisis.distribucionArray.map((item) => (
          <div
            key={item.nivel}
            className={`p-2.5 rounded-lg border ${item.colorBorder} ${item.colorBg} flex flex-col`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase">{item.nombre}</span>
              <span className="text-xs font-black">{item.porcentaje}%</span>
            </div>
            <span className="text-sm font-black mt-0.5">{item.conteo} doc.</span>
            <span className="text-[9.5px] truncate opacity-80">{item.descripcion}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
