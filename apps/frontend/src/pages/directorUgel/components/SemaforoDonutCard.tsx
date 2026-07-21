import { Card } from '@shared/ui/card';
import type { IUgelDashboardSemaforo } from '@sistema-monitoreo/shared-contracts';

const SEGMENTOS = [
  { key: 'logroPrevisto', label: 'Logro previsto', color: '#22c55e' },
  { key: 'enProceso', label: 'En proceso', color: '#f59e0b' },
  { key: 'critico', label: 'Crítico', color: '#ef4444' },
  { key: 'sinRegistro', label: 'Sin registro', color: '#cbd5e1' },
] as const;

export const SemaforoDonutCard = ({ semaforo }: { semaforo: IUgelDashboardSemaforo }) => {
  const total =
    semaforo.critico + semaforo.enProceso + semaforo.logroPrevisto + semaforo.sinRegistro;
  const denom = total || 1;

  const { stops } = SEGMENTOS.reduce<{ acc: number; stops: string[] }>(
    ({ acc, stops }, s) => {
      const inicio = (acc / denom) * 100;
      const nextAcc = acc + semaforo[s.key];
      const fin = (nextAcc / denom) * 100;
      return { acc: nextAcc, stops: [...stops, `${s.color} ${inicio}% ${fin}%`] };
    },
    { acc: 0, stops: [] },
  );
  const stopsStr = stops.join(', ');

  return (
    <Card className="p-5 border-border shadow-xs h-full">
      <h3 className="text-lg font-bold mb-4">Estado de las II.EE.</h3>
      <div className="flex items-center gap-6">
        <div
          className="relative w-32 h-32 rounded-full shrink-0"
          style={{ background: `conic-gradient(${stopsStr})` }}
        >
          <div className="absolute inset-[18%] rounded-full bg-card flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold leading-none">{total}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wide">II.EE.</span>
          </div>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {SEGMENTOS.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-text-muted">{s.label}</span>
              <span className="font-bold ml-1">{semaforo[s.key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
