import { ArrowLeft, SquarePen, Eye } from 'lucide-react';
import type { Institucion } from '@entities/model-instituciones';
import { 
  InstitutionProfileHeader, 
  InstitutionLocationInfo, 
  InstitutionDirectorInfo 
} from '@entities/model-instituciones/ui';
import { Button } from '@shared/ui/button';

interface Props {
  institucion: Institucion;
  isReadOnly: boolean;
  onBack: () => void;
  onEdit: () => void;
}

export const InstitutionProfileWidget = ({ institucion, isReadOnly, onBack, onEdit }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="h-[17px] w-[17px]" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-text">Detalle de Institución</h1>
            <p className="text-text-muted text-sm">Información del padrón oficial de la I.E.</p>
          </div>
        </div>

        {!isReadOnly && (
          <Button
            onClick={onEdit}
            className="flex items-center gap-2 font-bold cursor-pointer"
          >
            <SquarePen className="h-[15px] w-[15px]" />
            Editar
          </Button>
        )}

        {isReadOnly && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/25 rounded-lg text-xs font-semibold">
            <Eye className="h-3.5 w-3.5" />
            Solo lectura
          </span>
        )}
      </div>

      <InstitutionProfileHeader institucion={institucion} />
      <InstitutionLocationInfo institucion={institucion} />
      <InstitutionDirectorInfo institucion={institucion} />
    </div>
  );
};
