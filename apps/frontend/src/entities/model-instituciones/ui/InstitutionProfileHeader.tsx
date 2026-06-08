import { GraduationCap } from 'lucide-react';
import type { Institucion } from '../model';
import { ESTADO_COLOR } from '../constants';

export const InstitutionProfileHeader = ({ institucion }: { institucion: Institucion }) => {
  const estadoColor = ESTADO_COLOR[institucion.estado] || '#64748b';

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-hover h-20" />
      <div className="px-6 pb-5">
        <div className="flex items-end justify-between gap-4 -mt-8 mb-4 flex-wrap">
          {/* Logo/Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-surface flex items-center justify-center text-primary text-xl font-black shadow-sm flex-shrink-0">
            <GraduationCap className="h-7 w-7" />
          </div>
          {/* Estado */}
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full border mb-1 flex items-center gap-1.5"
            style={{
              backgroundColor: `${estadoColor}10`,
              borderColor: `${estadoColor}25`,
              color: estadoColor,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: estadoColor }} />
            {institucion.estado}
          </span>
        </div>
        <h2 className="text-lg font-bold text-text">{institucion.nombre}</h2>
        <p className="text-text-muted text-xs mt-1">
          Código Modular: <strong className="font-mono text-text">{institucion.codigoModular}</strong>
        </p>
      </div>
    </div>
  );
};
