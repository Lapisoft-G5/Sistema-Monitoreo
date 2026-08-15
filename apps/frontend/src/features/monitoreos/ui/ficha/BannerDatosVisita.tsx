import { School, User, UserCheck, Calendar } from 'lucide-react';
import type { Cronograma } from '@/entities/model-cronogramas';
import { formatearFechaCorta, formatearHora } from '@/shared/lib/fecha/fecha';

interface BannerDatosVisitaProps {
  visit: Cronograma;
}

export const BannerDatosVisita = ({ visit }: BannerDatosVisitaProps) => (
  <div className="px-4 sm:px-6 py-2.5 bg-primary-light/60 border-b border-primary/10 text-xs text-slate-600 font-semibold grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
    <div className="flex items-center gap-2 min-w-0">
      <School className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="truncate">
        Institución: <strong className="text-slate-800">{visit.institucion}</strong>
      </span>
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <User className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="truncate">
        Evaluado: <strong className="text-slate-800">{visit.docenteDirectivo}</strong>
      </span>
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="truncate">
        Especialista: <strong className="text-slate-800">{visit.especialista}</strong>
      </span>
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="truncate">
        Fecha:{' '}
        <strong className="text-slate-800">
          {formatearFechaCorta(visit.fechaHora)} - {formatearHora(visit.fechaHora)}
        </strong>
      </span>
    </div>
  </div>
);
