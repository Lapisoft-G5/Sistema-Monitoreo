import { User, AlertTriangle } from 'lucide-react';
import type { Institucion } from '@entities/model-instituciones';

const CAMPO = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-text-muted text-[0.68rem] font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-text text-sm font-medium">{value}</p>
  </div>
);

export const InstitutionDirectorInfo = ({ institucion }: { institucion: Institucion }) => {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg">
        <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">Director de la I.E.</h2>
          <p className="text-text-dim text-xs">Datos de contacto del directivo asignado</p>
        </div>
      </div>
      <div className="p-5">
        {institucion.director ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <CAMPO label="Director Asignado" value={institucion.director} />
            </div>
            <CAMPO
              label="DNI"
              value={institucion.directorDni || 'No registrado'}
            />
            <CAMPO
              label="Celular de Contacto"
              value={institucion.directorTelefono || 'Sin teléfono registrado'}
            />
            <CAMPO
              label="Correo Electrónico"
              value={institucion.directorCorreo || 'Sin correo registrado'}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center mb-3 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-text font-bold text-sm">Sin director asignado</p>
            <p className="text-text-muted text-xs mt-1 max-w-sm">
              Esta institución no cuenta actualmente con un director asignado en el padrón. Puede
              asignar uno editando este registro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
