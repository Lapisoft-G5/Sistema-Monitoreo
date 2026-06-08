import { User, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

// ── 1. Nivel Badge ──
export const NivelBadge = ({ nivel }: { nivel: string }) => {
  const colors: Record<string, string> = {
    'Inicial': 'bg-pink-100 text-pink-700 border-pink-200',
    'Primaria': 'bg-blue-100 text-blue-700 border-blue-200',
    'Secundaria': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  
  const defaultColor = 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold border ${colors[nivel] || defaultColor}`}>
      {nivel}
    </span>
  );
};

// ── 2. Estado Badge ──
export const EstadoBadge = ({ estado }: { estado: string }) => {
  if (estado === 'Satisfactorio') {
    return (
      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-green-500/10 text-green-700 border border-green-500/20 rounded-full text-[0.7rem] font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Satisfactorio
      </span>
    );
  }
  
  if (estado === 'Crítico') {
    return (
      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-[0.7rem] font-bold">
        <ShieldAlert className="w-3.5 h-3.5" /> Crítico
      </span>
    );
  }

  // En Proceso o por defecto
  return (
    <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full text-[0.7rem] font-bold">
      <Clock className="w-3.5 h-3.5" /> {estado}
    </span>
  );
};

// ── 3. Director Cell ──
export const DirectorCell = ({ director }: { director?: string | null }) => {
  if (!director) {
    return <span className="text-text-muted text-xs italic">Sin asignar</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
        <User className="w-3.5 h-3.5 text-text-muted" />
      </div>
      <span className="text-sm font-medium text-text">{director}</span>
    </div>
  );
};