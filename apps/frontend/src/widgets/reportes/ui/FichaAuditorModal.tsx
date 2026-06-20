import { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  FileText,
  X,
  Check,
  Clock,
  Download
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';

interface FichaAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Cronograma;
  template: Plantilla;
  fichaState: {
    checkedAspects: Record<string, boolean>;
    selectedLevels: Record<string, string>;
    generalComments: string;
  };
  downloadingId: string | null;
  onDownloadPDF: (visit: Cronograma, e: React.MouseEvent) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatVisitDate = (fechaHoraStr: string) => {
  try {
    const d = new Date(fechaHoraStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`;
    }
    return fechaHoraStr.split('T')[0];
  } catch {
    return fechaHoraStr;
  }
};

export const FichaAuditorModal = ({
  isOpen,
  onClose,
  visit,
  template,
  fichaState,
  downloadingId,
  onDownloadPDF,
}: FichaAuditorModalProps) => {
  const [fichaSelectedDesempenoId, setFichaSelectedDesempenoId] = useState<string>('');

  useEffect(() => {
    if (isOpen && template && template.desempenos.length > 0) {
      setFichaSelectedDesempenoId(template.desempenos[0].id);
    }
  }, [isOpen, template]);

  const activeFichaDesempeno = useMemo(() => {
    if (!template || !fichaSelectedDesempenoId) return null;
    return template.desempenos.find((d) => d.id === fichaSelectedDesempenoId) || null;
  }, [template, fichaSelectedDesempenoId]);

  if (!isOpen || !visit || !template || !fichaState) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="bg-surface w-full max-w-[1250px] border border-border rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              Auditoría de Ficha de Monitoreo Finalizada
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {template.tipoMonitoreo} ({template.anioAcademico})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadatos */}
        <div className="px-6 py-3 bg-primary-light border-b border-primary/5 text-xs text-slate-600 font-bold grid grid-cols-2 md:grid-cols-4 gap-4 shadow-inner">
          <div>I.E. Monitoreada: <span className="text-slate-800">{visit.institucion}</span></div>
          <div>Evaluado: <span className="text-slate-800">{visit.docenteDirectivo}</span></div>
          <div>Especialista: <span className="text-slate-800">{visit.especialista}</span></div>
          <div>Fecha Ejecución: <span className="text-slate-800">{formatVisitDate(visit.fechaHora)}</span></div>
        </div>

        {/* Split layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Sidebar: Desempeños */}
          <div className="w-full md:w-80 border-r border-border p-4 overflow-y-auto space-y-2 bg-slate-50/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
              Desempeños Evaluados
            </span>
            {template.desempenos.map((des, index) => {
              const isSelected = fichaSelectedDesempenoId === des.id;
              const selectedLevel = fichaState.selectedLevels[des.id];
              
              return (
                <div
                  key={des.id}
                  onClick={() => setFichaSelectedDesempenoId(des.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-2 text-left select-none relative ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/40 bg-primary-light/50 font-extrabold text-primary shadow-sm'
                      : 'border-border bg-surface text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="space-y-0.5 pr-4">
                    <div className="text-[11px] font-bold tracking-tight line-clamp-2">
                      {des.nombre}
                    </div>
                    <div className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                      <span>Nivel Calificado:</span>
                      <strong className="text-primary font-black">
                        Nivel {selectedLevel || 'III'}
                      </strong>
                    </div>
                  </div>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center rounded-full">
                    <Check className="h-2.5 w-2.5 font-bold" strokeWidth={3} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Panel de Detalle */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeFichaDesempeno ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                    {activeFichaDesempeno.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed border-b border-slate-100 pb-2">
                    {activeFichaDesempeno.descripcionCorta}
                  </p>
                </div>

                {/* Checklist (Read Only) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                     Checklist de Aspectos Verificados
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeFichaDesempeno.aspectos.map((asp, idx) => {
                      const isChecked = !!fichaState.checkedAspects[asp.id];
                      return (
                        <div
                          key={asp.id}
                          className={`border rounded-xl p-3.5 flex items-start gap-3.5 shadow-sm transition-all select-none ${
                            isChecked
                              ? 'border-emerald-200 bg-emerald-50/10'
                              : 'border-slate-100 bg-slate-50/30'
                          }`}
                        >
                          <span className={`h-4.5 w-4.5 rounded flex items-center justify-center border mt-0.5 shrink-0 transition-colors ${
                            isChecked 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-slate-100 border-slate-200 text-transparent'
                          }`}>
                            <Check className="h-3 w-3 font-bold" strokeWidth={3} />
                          </span>
                          <div className="pt-0.5 leading-relaxed text-xs text-slate-700">
                            <strong>Aspecto {idx + 1}:</strong> {asp.descripcion}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rúbrica seleccionada */}
                <div className="space-y-3.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Rúbrica de Calificación (Evaluación Registrada)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {template.niveles.map((niv) => {
                      const rubDetail = activeFichaDesempeno.rubrica.find((r) => r.nivel === niv.nivel);
                      const isSelected = fichaState.selectedLevels[activeFichaDesempeno.id] === niv.nivel;
                      
                      return (
                        <div
                          key={niv.nivel}
                          className={`border rounded-xl p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden transition-all duration-200 ${
                            isSelected
                              ? 'ring-2 bg-slate-50 border-transparent shadow'
                              : 'border-slate-200 opacity-60 bg-surface'
                          }`}
                          style={{
                            borderColor: isSelected ? niv.color : '#e2e8f0',
                            backgroundColor: isSelected ? niv.color + '07' : 'transparent',
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{ backgroundColor: niv.color }}
                          />
                          
                          <div className="pl-2 flex items-center justify-between">
                            <span
                              className="text-xs font-black uppercase tracking-wider"
                              style={{ color: niv.color }}
                            >
                              Nivel {niv.nivel}
                            </span>
                            <Badge
                              style={{
                                backgroundColor: niv.color + '15',
                                color: niv.color,
                                borderColor: niv.color + '20',
                              }}
                              className="text-[10px] font-bold"
                            >
                              {niv.denominacion}
                            </Badge>
                          </div>

                          <p className="pl-2 text-[11px] text-slate-600 font-medium leading-relaxed">
                            {rubDetail ? rubDetail.descripcion : 'Sin descripción registrada.'}
                          </p>
                          
                          {isSelected && (
                            <span className="absolute right-3.5 top-3.5 bg-emerald-500 text-white rounded-full h-4 w-4 flex items-center justify-center border border-white shadow-sm font-bold text-[8px]">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <FileText className="h-10 w-10 mb-2 stroke-1" />
                <span className="text-xs font-semibold">Seleccione un desempeño</span>
              </div>
            )}
          </div>
        </div>

        {/* Compromisos de mejora */}
        <div className="p-5 border-t border-border bg-slate-50/50 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Observaciones y Compromisos Registrados
          </span>
          <div className="bg-surface border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed shadow-inner max-h-24 overflow-y-auto">
            {fichaState.generalComments || 'No se registraron observaciones o compromisos adicionales en este monitoreo.'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-slate-50 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cerrado y Firmado Digitalmente por la UGEL</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={(e) => onDownloadPDF(visit, e)}
              disabled={downloadingId === visit.id}
              className="border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 h-10 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
            >
              {downloadingId === visit.id ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Exportar PDF</span>
            </Button>
            <Button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 h-10 rounded-xl cursor-pointer shadow-sm animate-all"
            >
              Cerrar Auditoría
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
