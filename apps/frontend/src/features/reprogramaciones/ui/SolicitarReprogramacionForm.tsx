import { useState } from 'react';
import {
  X,
  RefreshCw,
  Paperclip,
  Upload
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import type { Cronograma } from '@/entities/model-cronogramas';

interface SolicitarReprogramacionFormProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Cronograma;
  onSubmit: (data: {
    fechaNueva: string;
    motivo: string;
    archivoNombre: string;
  }) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatVisitDateLabel = (fechaStr: string) => {
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) {
      const parts = fechaStr.split('T');
      const [, , dayNum] = parts[0].split('-');
      const [h, min] = parts[1].split(':');
      return `${dayNum} Oct 2023, ${h}:${min} AM`;
    }
    return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} hrs`;
  } catch {
    return fechaStr;
  }
};

export const SolicitarReprogramacionForm = ({
  isOpen,
  onClose,
  visit,
  onSubmit,
}: SolicitarReprogramacionFormProps) => {
  const [reprogramarNuevaFecha, setReprogramarNuevaFecha] = useState<string>('');
  const [reprogramarMotivo, setReprogramarMotivo] = useState<string>('');
  const [reprogramarArchivoNombre, setReprogramarArchivoNombre] = useState<string>('');
  const [reprogramarArchivoSubiendo, setReprogramarArchivoSubiendo] = useState<boolean>(false);

  const handleSimulateUpload = () => {
    if (!visit) return;
    setReprogramarArchivoSubiendo(true);
    setTimeout(() => {
      setReprogramarArchivoSubiendo(false);
      setReprogramarArchivoNombre(
        `Oficio_Reprogramacion_IE_${visit.institucion.split(' - ')[0].replace(/\s+/g, '')}.pdf`
      );
    }, 1500);
  };

  const handleSendClick = () => {
    if (!reprogramarNuevaFecha || !reprogramarMotivo || !reprogramarArchivoNombre) return;
    onSubmit({
      fechaNueva: reprogramarNuevaFecha,
      motivo: reprogramarMotivo,
      archivoNombre: reprogramarArchivoNombre,
    });
    // Reset state
    setReprogramarNuevaFecha('');
    setReprogramarMotivo('');
    setReprogramarArchivoNombre('');
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="bg-surface w-full max-w-[580px] border border-border rounded-2xl shadow-xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Formulario de Registro (Mockup)
            </span>
            <h3 className="font-bold text-slate-800 text-base">
              Solicitar Reprogramación de Visita
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Metadatos lectura */}
        <div className="space-y-2 text-xs border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 text-slate-600">
          <div>I.E. Destino: <strong className="text-slate-800">{visit.institucion}</strong></div>
          <div>Especialista: <strong className="text-slate-800">{visit.especialista}</strong></div>
          <div>Fecha Programada Actual: <strong className="text-slate-800 text-primary">{formatVisitDateLabel(visit.fechaHora)}</strong></div>
        </div>

        {/* Campos de Entrada */}
        <div className="space-y-4">
          {/* Nueva fecha propuesta */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Nueva Fecha y Hora Propuesta
            </label>
            <input
              type="datetime-local"
              value={reprogramarNuevaFecha}
              onChange={(e) => setReprogramarNuevaFecha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>

          {/* Justificación */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Justificación / Motivo del Cambio
            </label>
            <textarea
              value={reprogramarMotivo}
              onChange={(e) => setReprogramarMotivo(e.target.value)}
              placeholder="Por favor detalle minuciosamente la justificación técnica del cambio de fecha. Ej: Huelga local, cruce con actividades distritales oficiales, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none leading-relaxed"
            />
          </div>

          {/* Carga mock del Oficio */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Documento Sustentatorio (Oficio / Solicitud PDF)
            </label>
            
            {reprogramarArchivoNombre ? (
              <div className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-3 flex items-center justify-between text-xs text-slate-700 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold truncate text-emerald-800">{reprogramarArchivoNombre}</span>
                  <span className="text-[9.5px] text-emerald-600 font-semibold">(1.2 MB)</span>
                </div>
                <button
                  onClick={() => setReprogramarArchivoNombre('')}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleSimulateUpload}
                className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center transition-colors cursor-pointer hover:bg-slate-50 flex flex-col items-center justify-center gap-2 select-none ${
                  reprogramarArchivoSubiendo ? 'bg-slate-50 border-primary/40' : ''
                }`}
              >
                {reprogramarArchivoSubiendo ? (
                  <>
                    <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-[10px] text-slate-500 font-bold">Subiendo archivo, por favor espere...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-primary stroke-[1.5]" />
                    <div className="text-xs text-slate-600 font-semibold">
                      Arrastra aquí el Oficio PDF o haz clic para subirlo
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Formatos admitidos: PDF (Máx. 10MB)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 font-bold text-xs py-2 px-4 h-10 rounded-xl cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendClick}
            disabled={!reprogramarNuevaFecha || !reprogramarMotivo || !reprogramarArchivoNombre || reprogramarArchivoSubiendo}
            className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2 px-5 h-10 rounded-xl shadow cursor-pointer disabled:opacity-50"
          >
            Enviar Solicitud
          </Button>
        </div>
      </Card>
    </div>
  );
};
