import { Users, ShieldCheck, Briefcase } from 'lucide-react';
import type { Especialista } from '@entities/model-especialistas';
import { Card } from '@shared/ui/card';

interface JefesStatsWidgetProps {
  jefes: Especialista[];
}

export const JefesStatsWidget = ({ jefes }: JefesStatsWidgetProps) => {
  const total = jefes.length;
  const activos = jefes.filter((j) => j.activo).length;
  const inactivos = total - activos;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 border border-border shadow-xs flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Total de Jefes de Área</span>
          <span className="text-3xl font-black text-text">{total}</span>
          <span className="text-xs text-text-muted mt-1">{activos} Activos / {inactivos} Inactivos</span>
        </div>
        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users className="w-5 h-5" /></div>
      </Card>

      <Card className="p-4 border border-border shadow-xs flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Jefes de Área Activos</span>
          <span className="text-3xl font-black text-text">{activos}</span>
          <span className="text-xs text-text-muted mt-1">Personal directivo vigente</span>
        </div>
        <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><ShieldCheck className="w-5 h-5" /></div>
      </Card>

      <Card className="p-4 border border-border shadow-xs flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Áreas Cubiertas</span>
          <span className="text-3xl font-black text-text">{total}</span>
          <span className="text-xs text-text-muted mt-1">Sedes y coordinaciones</span>
        </div>
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Briefcase className="w-5 h-5" /></div>
      </Card>
    </div>
  );
};