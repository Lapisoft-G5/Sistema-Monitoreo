import { Sparkles, FileText, Download, X, Activity } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Plantilla } from '@/entities/model-plantillas';

export type PestanaFicha = 'FICHA' | 'HISTORIAL';

interface CabeceraFichaProps {
  template: Plantilla;
  soloLectura: boolean;
  /** Sin pestañas cuando la visita no tiene historial que mostrar. */
  pestana: PestanaFicha | null;
  onPestana: (pestana: PestanaFicha) => void;
  onImprimir: () => void;
  onCerrar: () => void;
}

const PESTANAS = [
  { clave: 'FICHA' as const, etiqueta: 'Rúbricas de Ficha', Icono: FileText },
  { clave: 'HISTORIAL' as const, etiqueta: 'Historial Pedagógico', Icono: Activity },
];

/** Encabezado fijo mínimo: qué instrumento, acciones principales y pestañas. */
export const CabeceraFicha = ({
  template,
  soloLectura,
  pestana,
  onPestana,
  onImprimir,
  onCerrar,
}: CabeceraFichaProps) => (
  <div className="shrink-0 bg-slate-50 border-b border-border">
    {/* Barra principal compacta */}
    <div className="p-3 sm:p-4.5 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 truncate">
          <Sparkles className="h-3 w-3 shrink-0" />
          Ejecución de Ficha {soloLectura && '(Lectura)'}
        </span>
        <h2 className="text-sm sm:text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2 truncate">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <span className="truncate">{template.tipoMonitoreo} ({template.anioAcademico})</span>
        </h2>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {soloLectura && (
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/5 text-xs font-bold gap-1.5 cursor-pointer shadow-xs h-8 px-2.5 sm:px-3"
            onClick={onImprimir}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        )}
        <button
          onClick={onCerrar}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>

    {/* Pestañas de navegación */}
    {pestana && (
      <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 pt-1 bg-white border-t border-border/60 overflow-x-auto">
        {PESTANAS.map(({ clave, etiqueta, Icono }) => (
          <button
            key={clave}
            onClick={() => onPestana(clave)}
            className={`pb-2.5 pt-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 ${
              pestana === clave
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icono className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>{etiqueta}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);
