import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  X,
  Check,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';

interface LlenarFichaFormProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Cronograma;
  template: Plantilla;
  onSave: (
    visitId: string,
    data: {
      checkedAspects: Record<string, boolean>;
      selectedLevels: Record<string, string>;
      generalComments: string;
    }
  ) => void;
  onFinalize: (
    visitId: string,
    data: {
      checkedAspects: Record<string, boolean>;
      selectedLevels: Record<string, string>;
      generalComments: string;
    }
  ) => void;
}

const formatVisitTime = (fechaHoraStr: string) => {
  try {
    const parts = fechaHoraStr.split('T');
    if (parts.length > 1) {
      const [h, m] = parts[1].split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    const d = new Date(fechaHoraStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return fechaHoraStr;
  } catch {
    return fechaHoraStr;
  }
};

const formatVisitDate = (fechaHoraStr: string) => {
  try {
    const d = new Date(fechaHoraStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const parts = fechaHoraStr.split('T');
    return parts[0];
  } catch {
    return fechaHoraStr;
  }
};

export const LlenarFichaForm = ({
  isOpen,
  onClose,
  visit,
  template,
  onSave,
  onFinalize,
}: LlenarFichaFormProps) => {
  const [checkedAspects, setCheckedAspects] = useState<Record<string, boolean>>({});
  const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [fichaSelectedDesempenoId, setFichaSelectedDesempenoId] = useState<string>('');

  useEffect(() => {
    if (isOpen && visit) {
      const savedState = localStorage.getItem(`sistema-monitoreo:ficha-state:${visit.id}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setCheckedAspects(parsed.checkedAspects || {});
          setSelectedLevels(parsed.selectedLevels || {});
          setGeneralComments(parsed.generalComments || '');
        } catch {
          setCheckedAspects({});
          setSelectedLevels({});
          setGeneralComments('');
        }
      } else {
        setCheckedAspects({});
        setSelectedLevels({});
        setGeneralComments('');
      }

      if (template && template.desempenos.length > 0) {
        setFichaSelectedDesempenoId(template.desempenos[0].id);
      }
    }
  }, [isOpen, visit, template]);

  const activeFichaDesempeno = useMemo(() => {
    if (!template) return null;
    return template.desempenos.find((d) => d.id === fichaSelectedDesempenoId) || null;
  }, [template, fichaSelectedDesempenoId]);

  if (!isOpen || !visit || !template) return null;

  const isCompleted = visit.estado === 'COMPLETADO';

  const handleSaveClick = () => {
    onSave(visit.id, { checkedAspects, selectedLevels, generalComments });
  };

  const handleFinalizeClick = () => {
    // Validar que todos los desempeños tengan nivel calificado
    const missing = template.desempenos.filter((d) => !selectedLevels[d.id]);
    if (missing.length > 0) {
      alert(
        `Faltan calificar niveles. Por favor califique el nivel de logro para: \n${missing
          .map((m) => `• ${m.nombre.substring(0, 45)}...`)
          .join('\n')}`
      );
      return;
    }
    onFinalize(visit.id, { checkedAspects, selectedLevels, generalComments });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="bg-surface w-full max-w-[1250px] border border-border rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Ejecución de Ficha de Monitoreo {isCompleted && '(Lectura)'}
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

        <div className="px-6 py-3 bg-primary-light border-b border-primary/5 text-xs text-slate-600 font-bold grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Institución: <span className="text-slate-800">{visit.institucion}</span></div>
          <div>Evaluado: <span className="text-slate-800">{visit.docenteDirectivo}</span></div>
          <div>Especialista: <span className="text-slate-800">{visit.especialista}</span></div>
          <div>Fecha Programada: <span className="text-slate-800">{formatVisitDate(visit.fechaHora)} - {formatVisitTime(visit.fechaHora)}</span></div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Sidebar: Desempeños */}
          <div className="w-full md:w-80 border-r border-border p-4 overflow-y-auto space-y-2 bg-slate-50/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
              Criterios / Desempeños a Evaluar
            </span>
            {template.desempenos.map((des, index) => {
              const isSelected = fichaSelectedDesempenoId === des.id;
              const isEvaluated = !!selectedLevels[des.id];
              return (
                <div
                  key={des.id}
                  onClick={() => setFichaSelectedDesempenoId(des.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-2 shadow-xs leading-snug text-left select-none relative ${
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
                      <span>Nivel:</span>
                      <strong className={isEvaluated ? 'text-primary' : 'text-slate-400 font-normal italic'}>
                        {isEvaluated ? `Nivel ${selectedLevels[des.id]}` : 'Sin evaluar'}
                      </strong>
                    </div>
                  </div>
                  {isEvaluated && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center rounded-full">
                      <Check className="h-2.5 w-2.5 font-bold" strokeWidth={3} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Panel de Llenado */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeFichaDesempeno ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                    {activeFichaDesempeno.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {activeFichaDesempeno.descripcionCorta}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Aspectos a Evaluar / Checklist de Verificación
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeFichaDesempeno.aspectos.map((asp, idx) => {
                      const isChecked = !!checkedAspects[asp.id];
                      return (
                        <label
                          key={asp.id}
                          className={`border rounded-xl p-3.5 flex items-start gap-3.5 shadow-sm transition-all select-none ${
                            isCompleted ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isChecked
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isCompleted}
                            onChange={(e) => {
                              setCheckedAspects((prev) => ({
                                ...prev,
                                [asp.id]: e.target.checked,
                              }));
                            }}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 shrink-0"
                          />
                          <div className="pt-0.5 leading-relaxed text-xs text-slate-700">
                            <strong>Aspecto {idx + 1}:</strong> {asp.descripcion}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Rubrica de Calificación (Haz clic en un nivel para seleccionar)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {template.niveles.map((niv) => {
                      const rubDetail = activeFichaDesempeno.rubrica.find((r) => r.nivel === niv.nivel);
                      const isSelected = selectedLevels[activeFichaDesempeno.id] === niv.nivel;
                      return (
                        <div
                          key={niv.nivel}
                          onClick={() => {
                            if (!isCompleted) {
                              setSelectedLevels((prev) => ({
                                ...prev,
                                [activeFichaDesempeno.id]: niv.nivel,
                              }));
                            }
                          }}
                          className={`border rounded-xl p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden transition-all duration-200 ${
                            isCompleted ? 'cursor-default' : 'cursor-pointer hover:shadow font-semibold'
                          } ${
                            isSelected
                              ? 'ring-2 bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300 bg-surface'
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

        {/* Comentarios Generales */}
        <div className="p-5 border-t border-border bg-slate-50/50 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Observaciones y Compromisos de Mejora Generales
          </span>
          <textarea
            value={generalComments}
            onChange={(e) => setGeneralComments(e.target.value)}
            disabled={isCompleted}
            placeholder="Escriba aquí los compromisos acordados con el evaluado, fortalezas observadas y puntos clave de mejora formativa..."
            className="w-full bg-surface border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-20 resize-none leading-relaxed"
          />
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-border bg-slate-50 flex justify-between items-center">
          <div>
            {!isCompleted && (
              <span className="text-[10px] text-slate-500 font-bold">
                El progreso se guarda temporalmente de forma local en la cuenta del especialista.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isCompleted ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 h-10 rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveClick}
                  className="border-primary text-primary hover:bg-primary-light text-xs font-bold px-4 py-2 h-10 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Guardar como Borrador</span>
                </Button>
                <Button
                  onClick={handleFinalizeClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 h-10 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>Finalizar Monitoreo</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 h-10 rounded-xl cursor-pointer"
              >
                Cerrar Consulta
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
