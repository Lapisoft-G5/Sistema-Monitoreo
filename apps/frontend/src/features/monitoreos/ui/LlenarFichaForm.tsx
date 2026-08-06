import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  X,
  Check,
  CheckCircle2,
  Clock,
  Trophy,
  Download,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { HistorialChart } from './HistorialChart';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';
import { useReactToPrint } from 'react-to-print';
import { FichaPrintable } from '@/widgets/reportes/ui/FichaPrintable';
import { useRef } from 'react';
import { safeSetLocalStorage } from '@/shared/lib/utils';
import {
  formatearFechaVisita as formatVisitDate,
  formatearHoraVisita as formatVisitTime,
} from '@/shared/lib/fecha-visita';
import { useFormularioFicha } from '../hooks/use-formulario-ficha';
import type { DatosFicha } from '../lib/ficha-estado';
import {
  aDatosFicha,
  claveEstadoLocal,
  leerEstadoGuardado,
  tieneContextoCargado,
} from '../lib/estado-formulario';
import { validarCierreDeFicha } from '../lib/validacion-ficha';
import { ContextoDeAulaSeccion } from './ficha/ContextoDeAulaSeccion';
import { EvidenciaGeneralSeccion } from './ficha/EvidenciaGeneralSeccion';
import {
  NIVEL_LOGRO_LABELS,
  calcularResultadoBaremo,
  romanoANivel,
  type NivelLogro,
} from '@sistema-monitoreo/shared-contracts';

/**
 * Color y fondo de cada nivel de logro. Es decisión de presentación y por eso
 * vive aquí y no en el contrato, que sólo define la regla de cálculo.
 */
const COLORES_NIVEL: Record<NivelLogro, { nivelColor: string; nivelBg: string }> = {
  INICIO: { nivelColor: '#ef4444', nivelBg: '#fef2f2' },
  EN_PROCESO: { nivelColor: '#f59e0b', nivelBg: '#fffbeb' },
  LOGRO_ESPERADO: { nivelColor: '#10b981', nivelBg: '#ecfdf5' },
  LOGRO_DESTACADO: { nivelColor: '#6366f1', nivelBg: '#eef2ff' },
};
import { fetchDocenteById } from '@features/docentes/docente-service';
import type { Docente } from '@entities/model-docentes';

/**
 * Los tres campos que describían la ficha repetían la misma forma de dieciocho
 * líneas, una por cada uno. Es `DatosFicha`, que ya está declarado y es lo que
 * consume la persistencia.
 */
interface LlenarFichaFormProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Cronograma;
  template: Plantilla;
  onSave?: (visitId: string, datos: DatosFicha) => void;
  onFinalize?: (visitId: string, datos: DatosFicha) => void;
  /** Estado con el que abrir el formulario, si se reabre una ficha ya cargada. */
  initialState?: DatosFicha;
}

export const LlenarFichaForm = ({
  isOpen,
  onClose,
  visit,
  template,
  onSave,
  onFinalize,
  initialState,
}: LlenarFichaFormProps) => {
  // Una sola pieza de estado; los actualizadores conservan la firma de
  // `useState` para que los sitios de uso del formulario no cambien.
  const {
    estado,
    hidratar,
    setSelectedLevels,
    setSugerencias,
    setCompromisos,
    setRubricComments,
    setPreguntaExtraAnswers,
    setRespuestasEjeItem,
    setEvidenciaUrls,
    setObservacionesEjeItem,
    setContextoArea,
    setContextoGrado,
    setContextoSeccion,
    setContextoCampo,
  } = useFormularioFicha();

  const {
    checkedAspects,
    selectedLevels,
    generalComments,
    sugerencias,
    compromisos,
    rubricComments,
    preguntaExtraAnswers,
    respuestasEjeItem,
    evidenciaUrls,
    observacionesEjeItem,
  } = estado;
  const {
    area: contextoArea,
    grado: contextoGrado,
    seccion: contextoSeccion,
    alumnos: contextoAlumnos,
    alumnosNee: contextoAlumnosNee,
  } = estado.contexto;

  const [fichaSelectedDesempenoId, setFichaSelectedDesempenoId] = useState<string>('');

  const [evaluadoDocente, setEvaluadoDocente] = useState<Docente | null>(null);

  const [activeTab, setActiveTab] = useState<'FICHA' | 'HISTORIAL'>('FICHA');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  useEffect(() => {
    if (!isOpen || !visit) return;

    // Estado recibido, o el borrador local, o formulario en blanco. Un borrador
    // ilegible se descarta: impedir abrir la ficha sería peor que perderlo.
    const fuente =
      initialState ?? leerEstadoGuardado(localStorage.getItem(claveEstadoLocal(visit.id)));

    // El diferido es el comportamiento original y se conserva: la hidratación
    // ocurre fuera del ciclo de render que la dispara.
    setTimeout(() => hidratar(fuente), 0);

    if (template && template.desempenos.length > 0) {
      setTimeout(() => setFichaSelectedDesempenoId(template.desempenos[0].id), 0);
    }
  }, [isOpen, visit, template, initialState, hidratar]);

  useEffect(() => {
    if (isOpen && visit && visit.evaluadoId) {
      fetchDocenteById(visit.evaluadoId).then((doc) => {
        if (doc) {
          setTimeout(() => {
            setEvaluadoDocente(doc);

            // No se pisa un contexto ya cargado, venga del borrador local o del
            // estado recibido: lo que escribió el evaluador manda.
            const guardado = leerEstadoGuardado(localStorage.getItem(claveEstadoLocal(visit.id)));
            const hayContexto =
              tieneContextoCargado(guardado?.contexto) ||
              tieneContextoCargado(initialState?.contexto);

            if (!hayContexto) {
              setContextoArea(doc.especialidad || 'General');
              if (doc.secciones && doc.secciones.length > 0) {
                setContextoGrado(doc.secciones[0].grado || '');
                setContextoSeccion(doc.secciones[0].seccion || '');
              }
            }
          }, 0);
        }
      });
    } else {
      setTimeout(() => {
        setEvaluadoDocente(null);
      }, 0);
    }
  }, [isOpen, visit, initialState, setContextoArea, setContextoGrado, setContextoSeccion]);

  const activeFichaDesempeno = useMemo(() => {
    if (!template) return null;
    return template.desempenos.find((d) => d.id === fichaSelectedDesempenoId) || null;
  }, [template, fichaSelectedDesempenoId]);

  const sugerenciasAreas = useMemo(() => {
    if (!evaluadoDocente || !evaluadoDocente.especialidad) return [];
    return evaluadoDocente.especialidad
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);
  }, [evaluadoDocente]);

  if (!isOpen || !visit || !template) return null;

  const isCompleted = visit.estado === 'COMPLETADO';
  const isDirectivo = template.tipoMonitoreo.toUpperCase().includes('DIRECTIVO');

  const handleSaveClick = () => {
    onSave?.(visit.id, aDatosFicha(estado, visit.tipo));
  };

  const handleFinalizeClick = () => {
    // Las cinco condiciones de cierre viven en `lib/validacion-ficha.ts`, con
    // cobertura propia; acá sólo se informa la primera que falte.
    const falta = validarCierreDeFicha(template, estado);
    if (falta) {
      alert(falta);
      return;
    }

    onFinalize?.(visit.id, aDatosFicha(estado, visit.tipo));

    // Toast indicating email automation
    toast.success('Ficha finalizada con éxito', {
      description: 'El PDF oficial se está generando y enviando por correo al docente evaluado de forma automática.',
      duration: 6000,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    });
  };

  /**
   * Calificación consolidada que se muestra al cerrar la ficha.
   *
   * Usa el baremo del contrato compartido, que es el mismo que aplica el
   * backend al persistir. Antes esta pantalla tenía su propia tabla sobre el
   * puntaje total: coincidía con el backend sólo para plantillas de cinco
   * desempeños y discrepaba en cualquier otra, de modo que el evaluador podía
   * ver un nivel de logro y guardarse otro distinto. Ver H-28 de
   * PLAN_REMEDIACION.md.
   */
  const calcularCalificacion = () => {
    const niveles = template.desempenos
      .map((d) => romanoANivel(selectedLevels[d.id] || ''))
      .filter((n) => n > 0);

    const resultado = calcularResultadoBaremo(niveles);

    return {
      ...resultado,
      // Se conserva el nombre `puntajeMax` que consume el marcado de abajo.
      puntajeMax: template.desempenos.length * 4,
      nivel: NIVEL_LOGRO_LABELS[resultado.nivelLogro],
      ...COLORES_NIVEL[resultado.nivelLogro],
    };
  };

  const calificacion = isCompleted ? calcularCalificacion() : null;

  const currentFichaState = {
    checkedAspects,
    selectedLevels,
    generalComments,
    sugerencias,
    compromisos,
    rubricComments,
    preguntaExtraAnswers,
    respuestasEjeItem,
    evidenciaUrls,
    observacionesEjeItem,
    contexto: visit.tipo === 'DOCENTE' ? {
      areaCurricular: contextoArea,
      grado: contextoGrado,
      seccion: contextoSeccion,
      cantidadEstudiantes: Number(contextoAlumnos) || 0,
      cantidadEstudiantesNee: Number(contextoAlumnosNee) || 0,
    } : undefined
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <div style={{ display: 'none' }}>
        <FichaPrintable ref={printRef} visit={visit} template={template} fichaState={currentFichaState} />
      </div>
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
          <div className="flex items-center gap-3">
            {isCompleted && (
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/5 text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                onClick={() => handlePrint()}
              >
                <Download className="h-4 w-4" />
                Imprimir / PDF
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-primary-light border-b border-primary/5 text-xs text-slate-600 font-bold grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Institución: <span className="text-slate-800">{visit.institucion}</span></div>
          <div>Evaluado: <span className="text-slate-800">{visit.docenteDirectivo}</span></div>
          <div>Especialista: <span className="text-slate-800">{visit.especialista}</span></div>
          <div>Fecha Programada: <span className="text-slate-800">{formatVisitDate(visit.fechaHora)} - {formatVisitTime(visit.fechaHora)}</span></div>
        </div>

        {visit.tipo === 'DOCENTE' && (
          <ContextoDeAulaSeccion
            contexto={estado.contexto}
            onCambiar={setContextoCampo}
            sugerencias={{
              areas: sugerenciasAreas,
              secciones: evaluadoDocente?.secciones ?? [],
            }}
            soloLectura={isCompleted}
          />
        )}

        {visit.tipo === 'DOCENTE' && (
          <div className="flex items-center gap-6 px-6 pt-3 border-b border-border bg-white">
            <button
              onClick={() => setActiveTab('FICHA')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'FICHA'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              Rúbricas de Ficha
            </button>
            <button
              onClick={() => setActiveTab('HISTORIAL')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'HISTORIAL'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="h-4.5 w-4.5" />
              Historial Pedagógico
            </button>
          </div>
        )}

        {/* Contenedor con scroll interno — engloba cuerpo + comentarios + calificación */}
        <div className="flex-1 overflow-y-auto min-h-0">
        
        {activeTab === 'HISTORIAL' && visit.evaluadoId && (
          <div className="p-6">
            <HistorialChart evaluadoId={visit.evaluadoId} />
          </div>
        )}

        {activeTab === 'FICHA' && (
          <>
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

        {template.ejesItems && template.ejesItems.length > 0 && (
          <div className="border-t border-border pt-6 mt-6 px-5 space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              EJES E ITEMS
            </span>
            
            {template.ejesItems.map((item) => (
              <div key={item.id} className="bg-slate-50/30 border border-slate-200/60 rounded-2xl p-5 space-y-4 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary border border-primary/20 shadow-inner">
                    {item.numero}
                  </span>
                  <p className="text-sm text-slate-800 font-semibold leading-relaxed">{item.descripcion}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-10">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Nivel de Logro
                    </span>
                    <div className="flex items-center gap-2">
                      {['I', 'II', 'III', 'IV'].map((nivel) => {
                        const numVal = romanoANivel(nivel);
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
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer select-none flex items-center justify-center min-w-[45px] h-8 ${
                              isCompleted ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.98]'
                            }`}
                            style={{
                              backgroundColor: isSelected ? color : `${color}08`,
                              borderColor: isSelected ? color : `${color}30`,
                              color: isSelected ? '#ffffff' : color,
                              boxShadow: isSelected ? `0 4px 10px ${color}35` : undefined,
                            }}
                          >
                            {nivel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Observaciones
                    </span>
                    <textarea
                      value={observacionesEjeItem[item.id] || ''}
                      onChange={(e) =>
                        setObservacionesEjeItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      disabled={isCompleted}
                      placeholder="Escriba las observaciones para este eje/ítem..."
                      className="w-full bg-surface border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner h-[72px] resize-none leading-relaxed disabled:opacity-70"
                    />
                  </div>
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

        <EvidenciaGeneralSeccion
          evidencias={evidenciaUrls}
          onCambiar={(siguientes) => {
            setEvidenciaUrls(siguientes);
            // Se persiste el estado completo: antes se armaba a mano y perdía
            // las observaciones de ejes y el contexto de aula.
            safeSetLocalStorage(
              claveEstadoLocal(visit.id),
              JSON.stringify(aDatosFicha({ ...estado, evidenciaUrls: siguientes }, visit.tipo)),
            );
          }}
          onVerImagen={setPreviewImageUrl}
          soloLectura={isCompleted}
        />

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
                    const pts = romanoANivel(nivel || '');
                    const nivelObj = template.niveles.find((n) => n.nivel === nivel);
                    return (
                      <tr key={des.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 text-slate-400 font-bold text-center w-8">D{idx + 1}</td>
                        <td className="p-3 text-slate-700 font-medium leading-snug">{des.nombre}</td>
                        <td className="p-3 text-center">
                          {nivel ? (
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black"
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
                  {template.ejesItems && template.ejesItems.map((item, idx) => {
                    const numVal = respuestasEjeItem[item.id];
                    const nivel = numVal ? ['I', 'II', 'III', 'IV'][numVal - 1] : null;
                    const nivelObj = nivel ? template.niveles.find((n) => n.nivel === nivel) : null;
                    return (
                      <tr key={item.id} className={(template.desempenos.length + idx) % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 text-slate-400 font-bold text-center w-8">R{item.numero}</td>
                        <td className="p-3 text-slate-700 font-medium leading-snug">{item.descripcion}</td>
                        <td className="p-3 text-center">
                          {nivel ? (
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black"
                              style={{ backgroundColor: (nivelObj?.color ?? '#94a3b8') + '20', color: nivelObj?.color ?? '#94a3b8' }}
                            >
                              Nivel {nivel}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-black text-slate-700">
                          {numVal > 0 ? numVal : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-slate-200 bg-slate-50/50">
                    <td colSpan={3} className="p-3 font-bold text-slate-500 text-[11px] text-right uppercase tracking-wider">
                      TOTAL (Desempeños D1-D5)
                    </td>
                    <td className="p-3 text-center font-black text-base" style={{ color: calificacion.nivelColor }}>
                      {calificacion.puntajeTotal} / {calificacion.puntajeMax}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: calificacion.nivelColor + '10' }}>
                    <td colSpan={3} className="p-3 font-black text-slate-700 text-xs text-right uppercase tracking-wider">
                      NIVEL DE LOGRO ALCANZADO
                    </td>
                    <td className="p-3 text-center font-black text-sm" style={{ color: calificacion.nivelColor }}>
                      {calificacion.nivel} ({calificacion.porcentaje}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )} {/* fin FICHA */}
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

      {previewImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Vista Previa de Evidencia
              </span>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-slate-50 flex items-center justify-center min-h-[300px]">
              <img
                src={previewImageUrl}
                alt="Vista previa de evidencia"
                className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200 shadow-sm"
              />
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button onClick={() => setPreviewImageUrl(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
