import { MapPin } from 'lucide-react';
import type { Institucion } from '../model';
import { NIVEL_LABEL } from '../constants';

const CAMPO = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-text text-sm font-medium">{value}</p>
  </div>
);

export const InstitutionLocationInfo = ({ institucion }: { institucion: Institucion }) => {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">Información de la Institución</h2>
          <p className="text-text-dim text-xs">Identificación y ubicación de la I.E.</p>
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <CAMPO label="Código Modular" value={institucion.codigoModular} />
        <CAMPO label="Nivel Educativo" value={NIVEL_LABEL[institucion.nivel] || institucion.nivel} />
        <div className="sm:col-span-2">
          <CAMPO label="Dirección" value={institucion.direccion} />
        </div>
        <CAMPO label="Distrito" value={institucion.distrito} />
        <CAMPO label="Provincia" value={institucion.provincia || 'Lampa'} />
        <CAMPO label="Zona" value={institucion.zona || 'Urbana'} />
      </div>
    </div>
  );
};
