import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/shared/ui/card';
import type { AnalisisDesempenoResultado } from '@/features/reportes/lib/analisis-desempeno';

interface GraficoNivelEducativoProps {
  analisis: AnalisisDesempenoResultado;
}

export const GraficoNivelEducativo = ({ analisis }: GraficoNivelEducativoProps) => {
  const data = analisis.porNivelEducativo.map((item) => ({
    nivel: item.nivelEducativo,
    'Nivel I (Inicio)': item.nivelI,
    'Nivel II (Proceso)': item.nivelII,
    'Nivel III (Satisfactorio)': item.nivelIII,
    'Nivel IV (Destacado)': item.nivelIV,
    promedio: item.promedio,
    total: item.total,
  }));

  return (
    <Card className="p-5 border border-border shadow-xs bg-surface flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-text">Desempeño por Nivel Educativo</h3>
          <span className="text-xs text-text-muted">Inicial / Primaria / Secundaria</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Comparativa de niveles de logro alcanzados según la etapa escolar.
        </p>

        {data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-text-muted">
            No hay datos suficientes para la comparativa.
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e2e8f0)" />
                <XAxis
                  dataKey="nivel"
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-border shadow-md text-xs space-y-1">
                          <div className="font-bold text-slate-800">{label}</div>
                          {payload.map((entry) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-4 text-[11px]"
                            >
                              <span style={{ color: entry.color }} className="font-semibold">
                                {entry.name}:
                              </span>
                              <span className="font-bold text-slate-900">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Nivel I (Inicio)" fill="#ef4444" stackId="a" />
                <Bar dataKey="Nivel II (Proceso)" fill="#f59e0b" stackId="a" />
                <Bar dataKey="Nivel III (Satisfactorio)" fill="#3b82f6" stackId="a" />
                <Bar dataKey="Nivel IV (Destacado)" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border mt-3">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Promedios por etapa:</span>
          <div className="flex items-center gap-3">
            {analisis.porNivelEducativo.map((item) => (
              <span key={item.nivelEducativo} className="font-bold text-slate-700">
                {item.nivelEducativo}: <span className="text-primary">{item.promedio} pts</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
