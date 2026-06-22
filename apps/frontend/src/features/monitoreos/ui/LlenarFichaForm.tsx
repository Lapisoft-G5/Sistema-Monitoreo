import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  X,
  Check,
  CheckCircle2,
  Clock,
  Trophy,
  Upload
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
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
      sugerencias?: string;
      compromisos?: string;
      rubricComments?: Record<string, string>;
      preguntaExtraAnswers?: Record<string, boolean>;
      respuestasEjeItem?: Record<string, number>;
      evidenciaUrls?: Record<string, string>;
    }
  ) => void;
  onFinalize: (
    visitId: string,
    data: {
      checkedAspects: Record<string, boolean>;
      selectedLevels: Record<string, string>;
      generalComments: string;
      sugerencias?: string;
      compromisos?: string;
      rubricComments?: Record<string, string>;
      preguntaExtraAnswers?: Record<string, boolean>;
      respuestasEjeItem?: Record<string, number>;
      evidenciaUrls?: Record<string, string>;
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
  const [sugerencias, setSugerencias] = useState('');
  const [compromisos, setCompromisos] = useState('');
  const [rubricComments, setRubricComments] = useState<Record<string, string>>({});
  const [preguntaExtraAnswers, setPreguntaExtraAnswers] = useState<Record<string, boolean>>({});
  const [fichaSelectedDesempenoId, setFichaSelectedDesempenoId] = useState<string>('');
  const [respuestasEjeItem, setRespuestasEjeItem] = useState<Record<string, number>>({});
  const [evidenciaUrls, setEvidenciaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && visit) {
      const savedState = localStorage.getItem(`sistema-monitoreo:ficha-state:${visit.id}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setTimeout(() => {
            setCheckedAspects(parsed.checkedAspects || {});
            setSelectedLevels(parsed.selectedLevels || {});
            setGeneralComments(parsed.generalComments || '');
            setSugerencias(parsed.sugerencias || '');
            setCompromisos(parsed.compromisos || '');
            setRubricComments(parsed.rubricComments || {});
            setPreguntaExtraAnswers(parsed.preguntaExtraAnswers || {});
            setRespuestasEjeItem(parsed.respuestasEjeItem || {});
            setEvidenciaUrls(parsed.evidenciaUrls || {});
          }, 0);
        } catch {
          setTimeout(() => {
            setCheckedAspects({});
            setSelectedLevels({});
            setGeneralComments('');
            setSugerencias('');
            setCompromisos('');
            setRubricComments({});
            setPreguntaExtraAnswers({});
            setRespuestasEjeItem({});
            setEvidenciaUrls({});
          }, 0);
        }
      } else {
        setTimeout(() => {
            setCheckedAspects({});
            setSelectedLevels({});
            setGeneralComments('');
            setSugerencias('');
            setCompromisos('');
            setRubricComments({});
            setPreguntaExtraAnswers({});
            setRespuestasEjeItem({});
            setEvidenciaUrls({});
          }, 0);
      }

      if (template && template.desempenos.length > 0) {
        setTimeout(() => setFichaSelectedDesempenoId(template.desempenos[0].id), 0);
      }
    }
  }, [isOpen, visit, template]);

  const activeFichaDesempeno = useMemo(() => {
    if (!template) return null;
    return template.desempenos.find((d) => d.id === fichaSelectedDesempenoId) || null;
  }, [template, fichaSelectedDesempenoId]);

  if (!isOpen || !visit || !template) return null;

  const isCompleted = visit.estado === 'COMPLETADO';
  const isDirectivo = template.tipoMonitoreo.toUpperCase().includes('DIRECTIVO');

  const handleSaveClick = () => {
    onSave(visit.id, {
      checkedAspects,
      selectedLevels,
      generalComments,
      sugerencias,
      compromisos,
      rubricComments,
      preguntaExtraAnswers,
      respuestasEjeItem,
      evidenciaUrls,
    });
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
    onFinalize(visit.id, {
      checkedAspects,
      selectedLevels,
      generalComments,
      sugerencias,
      compromisos,
      rubricComments,
      preguntaExtraAnswers,
      respuestasEjeItem,
      evidenciaUrls,
    });
  };

  // Calificación consolidada
  const romanToNum = (r: string) => ({ I: 1, II: 2, III: 3, IV: 4 }[r] ?? 0);

  const calcularCalificacion = () => {
    const numDesempenos = template.desempenos.length;
    const puntajeMax = numDesempenos * 4;
    const puntajeMin = numDesempenos * 1;
    const puntajeTotal = template.desempenos.reduce(
      (acc, d) => acc + romanToNum(selectedLevels[d.id] || ''),
      0
    );
    const porcentaje = puntajeMax > 0 ? Math.round((puntajeTotal / puntajeMax) * 100) : 0;

    let nivel: string;
    let nivelColor: string;
    let nivelBg: string;
    if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.25)) {
      nivel = 'INICIO';
      nivelColor = '#ef4444';
      nivelBg = '#fef2f2';
    } else if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.50)) {
      nivel = 'EN PROCESO';
      nivelColor = '#f59e0b';
      nivelBg = '#fffbeb';
    } else if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.75)) {
      nivel = 'LOGRADO';
      nivelColor = '#10b981';
      nivelBg = '#ecfdf5';
    } else {
      nivel = 'SATISFACTORIO';
      nivelColor = '#6366f1';
      nivelBg = '#eef2ff';
    }

    return { puntajeTotal, puntajeMax, porcentaje, nivel, nivelColor, nivelBg };
  };

  const calificacion = isCompleted ? calcularCalificacion() : null;

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

        {/* Contenedor con scroll interno — engloba cuerpo + comentarios + calificación */}
        <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col md:flex-row min-h-[300px]">
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

                {!isDirectivo && activeFichaDesempeno.aspectos && activeFichaDesempeno.aspectos.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Aspectos a Considerar
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                      {activeFichaDesempeno.aspectos.map((asp, idx) => (
                        <li key={asp.id}>
                          <strong>Aspecto {idx + 1}:</strong> {asp.descripcion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Descripción de Niveles (Haz clic en un nivel para seleccionar)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {template.niveles.map((niv) => {
                      const rubDetail = activeFichaDesempeno.rubrica?.find((r) => r.nivel === niv.nivel);
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

                          <div className="pl-2 flex flex-col gap-1">
                            <span
                              className="text-xs font-black uppercase tracking-wider"
                              style={{ color: niv.color }}
                            >
                              Nivel {niv.nivel}
                            </span>
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: niv.color }}
                            >
                              {niv.denominacion}
                            </span>
                          </div>

                          <p className="pl-2 text-[11px] text-slate-700 font-medium leading-relaxed">
                            {rubDetail?.descripcion || 'Sin descripción registrada.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeFichaDesempeno.preguntaExtra && (
                  <div className="space-y-2 mt-4 p-4 border border-slate-200 rounded-xl bg-amber-50/30">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                      Pregunta Extra
                    </span>
                    <p className="text-sm font-medium text-slate-700">{activeFichaDesempeno.preguntaExtra}</p>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`pregunta-${activeFichaDesempeno.id}`}
                          checked={preguntaExtraAnswers[activeFichaDesempeno.id] === true}
                          onChange={() =>
                            setPreguntaExtraAnswers((prev) => ({
                              ...prev,
                              [activeFichaDesempeno.id]: true,
                            }))
                          }
                          disabled={isCompleted}
                          className="accent-emerald-600"
                        />
                        <span className="text-xs font-bold text-emerald-700">SÍ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`pregunta-${activeFichaDesempeno.id}`}
                          checked={preguntaExtraAnswers[activeFichaDesempeno.id] === false}
                          onChange={() =>
                            setPreguntaExtraAnswers((prev) => ({
                              ...prev,
                              [activeFichaDesempeno.id]: false,
                            }))
                          }
                          disabled={isCompleted}
                          className="accent-red-600"
                        />
                        <span className="text-xs font-bold text-red-600">NO</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Observaciones para esta Rúbrica
                  </span>
                  <textarea
                    value={rubricComments[activeFichaDesempeno.id] || ''}
                    onChange={(e) => {
                      setRubricComments((prev) => ({
                        ...prev,
                        [activeFichaDesempeno.id]: e.target.value,
                      }));
                    }}
                    disabled={isCompleted}
                    placeholder="Escriba observaciones o evidencias encontradas para esta rúbrica específica..."
                    className="w-full bg-surface border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none leading-relaxed"
                  />
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

        {/* Ejes e Items (Solo Docente) */}
        {template.ejesItems && template.ejesItems.length > 0 && (
          <div className="border-t border-border pt-6 mt-6 px-5 space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              EJES E ITEMS
            </span>
            
            {template.ejesItems.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {item.numero}
                  </span>
                  <p className="text-sm text-slate-700 font-medium">{item.descripcion}</p>
                </div>
                
                <div className="flex items-center gap-4 pl-9">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
                    NIVEL DE LOGRO:
                  </span>
                  <div className="flex items-center gap-2">
                    {['I', 'II', 'III', 'IV'].map((nivel) => {
                      const numVal = romanToNum(nivel);
                      const levelConfig = template.niveles.find((n) => n.nivel === nivel);
                      const color = levelConfig?.color || '#3b82f6';
                      const isSelected = respuestasEjeItem[item.id] === numVal;

                      return (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => {
                            if (!isCompleted) {
                              setRespuestasEjeItem((prev) => ({ ...prev, [item.id]: numVal }));
                            }
                          }}
                          disabled={isCompleted}
                          className={`px-3.5 py-1 rounded-lg text-xs font-black transition-all border cursor-pointer select-none flex items-center justify-center min-w-[42px] ${
                            isCompleted ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: isSelected ? color : `${color}08`,
                            borderColor: isSelected ? color : `${color}30`,
                            color: isSelected ? '#ffffff' : color,
                            boxShadow: isSelected ? `0 2px 6px ${color}30` : undefined,
                          }}
                        >
                          {nivel}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pl-9">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    EVIDENCIAS
                  </span>
                  {evidenciaUrls[item.id] ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={evidenciaUrls[item.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-semibold underline"
                      >
                        Ver evidencia
                      </a>
                      {!isCompleted && (
                        <button
                          onClick={() => {
                            setEvidenciaUrls((prev) => {
                              const next = { ...prev };
                              delete next[item.id];
                              return next;
                            });
                          }}
                          className="text-xs text-destructive font-semibold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ) : !isCompleted ? (
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      <Upload className="h-4 w-4" />
                      Subir archivo
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { fichasApi } = await import('@/features/monitoreos/api/fichas.api');
                            const ficha = await fichasApi.findByVisita(visit.id);
                            if (ficha) {
                              const result = await fichasApi.subirEvidenciaEjeItem(ficha.id, item.id, file);
                              setEvidenciaUrls((prev) => ({ ...prev, [item.id]: result.evidenciaUrl }));
                            }
                          } catch (err) {
                            console.error('Error uploading evidence:', err);
                          }
                        }}
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sugerencias y Compromisos */}
        <div className="p-5 border-t border-border bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Sugerencias
            </span>
            <textarea
              value={sugerencias}
              onChange={(e) => setSugerencias(e.target.value)}
              disabled={isCompleted}
              placeholder="Escriba aquí las sugerencias..."
              className="w-full bg-surface border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Compromisos
            </span>
            <textarea
              value={compromisos}
              onChange={(e) => setCompromisos(e.target.value)}
              disabled={isCompleted}
              placeholder="Escriba aquí los compromisos..."
              className="w-full bg-surface border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* CONSOLIDADO DE NIVELES DE LOGRO */}
        {calificacion && (
          <div className="p-5 border-t border-border" style={{ backgroundColor: calificacion.nivelBg + 'cc' }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4.5 w-4.5" style={{ color: calificacion.nivelColor }} />
              <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: calificacion.nivelColor }}>
                CONSOLIDADO DE NIVELES DE LOGRO
              </span>
            </div>

            <div className="bg-white/80 rounded-xl border border-white shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left p-3 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">N°</th>
                    <th className="text-left p-3 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">ASPECTOS (Desempeños)</th>
                    <th className="text-center p-3 font-extrabold text-slate-500 uppercase tracking-wider text-[10px] w-20">NIVEL</th>
                    <th className="text-center p-3 font-extrabold text-slate-500 uppercase tracking-wider text-[10px] w-16">PUNTAJE</th>
                  </tr>
                </thead>
                <tbody>
                  {template.desempenos.map((des, idx) => {
                    const nivel = selectedLevels[des.id];
                    const pts = romanToNum(nivel || '');
                    const nivelObj = template.niveles.find((n) => n.nivel === nivel);
                    const label = idx < 5 ? `D${idx + 1}` : `R${idx + 1}`;
                    return (
                      <tr key={des.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 text-slate-400 font-bold text-center w-8">{label}</td>
                        <td className="p-3 text-slate-700 font-medium leading-snug">{des.nombre}</td>
                        <td className="p-3 text-center">
                          {nivel ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                              style={{ backgroundColor: (nivelObj?.color ?? '#94a3b8') + '20', color: nivelObj?.color ?? '#94a3b8' }}
                            >
                              Nivel {nivel}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-black text-slate-700">
                          {pts > 0 ? pts : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-200" style={{ backgroundColor: calificacion.nivelBg }}>
                    <td colSpan={3} className="p-3 font-extrabold text-slate-700 text-xs text-right">TOTAL</td>
                    <td className="p-3 text-center font-extrabold text-base" style={{ color: calificacion.nivelColor }}>
                      {calificacion.puntajeTotal} / {calificacion.puntajeMax}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: calificacion.nivelColor + '15' }}>
                    <td colSpan={3} className="p-3 font-extrabold text-slate-700 text-xs text-right">NIVEL DE LOGRO</td>
                    <td className="p-3 text-center font-extrabold text-sm" style={{ color: calificacion.nivelColor }}>
                      {calificacion.nivel} ({calificacion.porcentaje}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        </div> {/* fin scroll interno */}

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
