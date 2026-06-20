import { useState, useMemo } from 'react';
import {
  X,
  Check,
  FileText,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import type { Plantilla } from '@entities/model-plantillas';

interface PlantillaPreviewModalProps {
  plantilla: Plantilla;
  onClose: () => void;
}

export const PlantillaPreviewModal = ({ plantilla, onClose }: PlantillaPreviewModalProps) => {
  const [selectedDesempenoId, setSelectedDesempenoId] = useState<string>(() => {
    return plantilla.desempenos.length > 0 ? plantilla.desempenos[0].id : '';
  });

  const activeDesempeno = useMemo(() => {
    if (!selectedDesempenoId) return null;
    return plantilla.desempenos.find((d) => d.id === selectedDesempenoId) || null;
  }, [plantilla, selectedDesempenoId]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="bg-surface w-full max-w-[1200px] border border-border rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Visualizador de Estructura (Mockup)
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {plantilla.tipoMonitoreo} ({plantilla.anioAcademico})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-header con información técnica resumida */}
        <div className="px-6 py-2.5 bg-primary-light border-b border-primary/5 text-xs text-primary font-bold flex flex-wrap gap-x-6 gap-y-1">
          <span>Año Académico: <strong className="text-slate-800">{plantilla.anioAcademico}</strong></span>
          <span>Baremo de Escala: <strong className="text-slate-800">{plantilla.baremo}</strong></span>
          <span>Estado Vigencia: <strong className="text-slate-800">{plantilla.estado}</strong></span>
          <span>Total Criterios: <strong className="text-slate-800">{plantilla.desempenos.length} desempeños</strong></span>
        </div>

        {/* Cuerpo del Modal (Distribución en Dos Columnas) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Columna Izquierda: Listado de Desempeños */}
          <div className="w-full md:w-80 border-r border-border p-4 overflow-y-auto space-y-2 bg-slate-50/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
              Desempeños / Criterios
            </span>
            {plantilla.desempenos.map((des, index) => {
              const isSelected = selectedDesempenoId === des.id;
              return (
                <div
                  key={des.id}
                  onClick={() => setSelectedDesempenoId(des.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-2 shadow-xs leading-snug text-left select-none ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/40 bg-primary-light/50 font-extrabold text-primary'
                      : 'border-border bg-surface text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold tracking-tight line-clamp-2">
                      {des.nombre}
                    </div>
                    <div className="text-[9.5px] font-semibold text-slate-400 line-clamp-1">
                      {des.descripcionCorta}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Columna Derecha: Detalle del Desempeño Seleccionado */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {activeDesempeno ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Título de Criterio */}
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                    {activeDesempeno.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {activeDesempeno.descripcionCorta}
                  </p>
                </div>

                {/* Fila 1: Aspectos a Monitorear (Checklist) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Aspectos a Evaluar (Checklist de Cumplimiento)
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeDesempeno.aspectos.map((asp, idx) => (
                      <div
                        key={asp.id}
                        className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-start gap-3 shadow-inner text-xs text-slate-700"
                      >
                        <span className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <div className="pt-0.5 leading-relaxed font-medium">
                          <strong>Indicador {idx + 1}:</strong> {asp.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fila 2: Niveles de Logro (Rúbrica Curricular) */}
                <div className="space-y-3.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Rúbrica de Calificación por Niveles
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plantilla.niveles.map((niv) => {
                      const rubDetail = activeDesempeno.rubrica.find((r) => r.nivel === niv.nivel);
                      return (
                        <div
                          key={niv.nivel}
                          className="border border-slate-100 rounded-xl p-4 flex flex-col gap-2 bg-surface shadow-sm relative overflow-hidden"
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
                            {rubDetail ? rubDetail.descripcion : 'Sin descripción registrada para este nivel.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <FileText className="h-10 w-10 mb-2 stroke-1" />
                <span className="text-xs font-semibold">Seleccione un desempeño a la izquierda</span>
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-border bg-slate-50 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
          >
            Cerrar Vista Previa
          </Button>
        </div>
      </Card>
    </div>
  );
};
