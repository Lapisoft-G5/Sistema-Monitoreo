import { ArrowLeft, SquarePen, Eye } from 'lucide-react';
import type { Institucion } from '@entities/model-instituciones';

import {
  InstitutionProfileHeader,
  InstitutionLocationInfo,
  InstitutionDirectorInfo,
} from '@features/institutions/ui';

import { Button } from '@shared/ui/button';

interface Props {
  institucion: Institucion;
  isReadOnly: boolean;
  onBack: () => void;
  onEdit: () => void;
}

export const InstitutionProfileWidget = ({ institucion, isReadOnly, onBack, onEdit }: Props) => {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-0 duration-300">
      {/* Cabecera con Botones de Acción */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-surface p-4 border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-bg border border-border text-text-muted hover:text-text hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text m-0 leading-tight">
              Detalle de Institución
            </h1>
            <p className="text-text-muted text-[0.8rem] m-0">Ficha técnica del padrón oficial</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReadOnly ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/25 rounded-lg text-xs font-semibold">
              <Eye className="h-3.5 w-3.5" />
              Solo lectura
            </span>
          ) : (
            <Button onClick={onEdit} className="flex items-center gap-2 font-bold cursor-pointer">
              <SquarePen className="h-[16px] w-[16px]" />
              Editar Registro
            </Button>
          )}
        </div>
      </div>

      {/* Cuerpo del Perfil ensamblado con los componentes de la Entidad */}
      <div className="flex flex-col gap-5">
        <InstitutionProfileHeader institucion={institucion} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InstitutionLocationInfo institucion={institucion} />
          <InstitutionDirectorInfo institucion={institucion} />
        </div>
      </div>
    </div>
  );
};
