import { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Calendar,
  Hash,
  GraduationCap,
  AlertCircle,
  Clock,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useCronogramas, type Cronograma } from '@/entities/model-cronogramas';
import { useUser } from '@/entities/model-user';
import { usePlantillas } from '@/entities/model-plantillas';
import { LlenarFichaForm } from '@/features/monitoreos';
import {
  SolicitarReprogramacionForm,
  DecidirReprogramacionForm
} from '@/features/reprogramaciones';

interface CalendarioSidebarProps {
  selectedVisitId: string | null;
  setSelectedVisitId: (id: string | null) => void;
  selectedDateStr: string;
  onClose: () => void;
  filteredVisits: Cronograma[];
}

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

const getVisitStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'PROGRAMADO':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'EN PROCESO':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'COMPLETADO':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'REPROGRAMADO':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CANCELADO':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const getVisitColorDot = (estado: string) => {
  switch (estado) {
    case 'PROGRAMADO':
      return 'bg-blue-500';
    case 'EN PROCESO':
      return 'bg-rose-500';
    case 'COMPLETADO':
      return 'bg-emerald-500';
    case 'REPROGRAMADO':
      return 'bg-amber-500';
    case 'CANCELADO':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
};

export const CalendarioSidebar = ({
  selectedVisitId,
  setSelectedVisitId,
  selectedDateStr,
  onClose,
  filteredVisits,
}: CalendarioSidebarProps) => {
  const { user } = useUser();
  const isEspecialista = user?.role === 'especialista';
  const {
    cronogramas,
    setCronogramas,
    reprogramaciones,
    submitRescheduleRequest,
    approveRescheduleRequest,
    rejectRescheduleRequest,
    deleteCronograma,
  } = useCronogramas();

  // Modales locales
  const [showFichaModal, setShowFichaModal] = useState<boolean>(false);
  const [showSolicitarReprogramarModal, setShowSolicitarReprogramarModal] = useState<boolean>(false);
  const [showReprogramarModal, setShowReprogramarModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Plantillas cargadas de la entidad
  const { plantillas } = usePlantillas();

  const selectedVisit = useMemo(() => {
    if (!selectedVisitId) return null;
    return cronogramas.find((v) => v.id === selectedVisitId) || null;
  }, [cronogramas, selectedVisitId]);

  const activeRequest = useMemo(() => {
    if (!selectedVisit) return null;
    return reprogramaciones[selectedVisit.id] || null;
  }, [reprogramaciones, selectedVisit]);

  const visitsOnSelectedDate = useMemo(() => {
    return filteredVisits.filter((v) => v.fechaHora.substring(0, 10) === selectedDateStr);
  }, [filteredVisits, selectedDateStr]);

  const activeTemplate = useMemo(() => {
    if (!selectedVisit) return null;
    const searchType = selectedVisit.tipo === 'DOCENTE' ? 'Monitoreo Docente' : 'Monitoreo Directivo';
    const isDirector = user?.role === 'director_ie' || user?.role === 'director_institucion';

    const matchedTemplate = plantillas.find((p) => {
      if (p.tipoMonitoreo !== searchType || p.estado !== 'Vigente') return false;
      if (isDirector) {
        return p.creadoPorRole === 'director_ie' && p.ieId === user?.institucion;
      } else {
        return !p.creadoPorRole || p.creadoPorRole === 'jefe_gestion';
      }
    });

    if (!matchedTemplate) {
      // Fallback a cualquier plantilla general vigente de ese tipo
      return plantillas.find((p) => p.tipoMonitoreo === searchType && p.estado === 'Vigente') || plantillas[0];
    }

    return matchedTemplate;
  }, [selectedVisit, plantillas, user]);

  const simulateFichaLlena = (visitId: string) => {
    const aspects: Record<string, boolean> = {
      d1_a1: true,
      d1_a2: true,
      d1_a3: true,
      d2_a1: true,
      d2_a2: true,
      d2_a3: true,
      ad2_1: true,
      ad2_2: true,
      ad2_3: true,
      ad3_1: true,
      ad3_2: true,
      ad3_3: true,
    };
    const levels: Record<string, string> = {
      d1: 'III',
      d2: 'III',
      d3: 'IV',
      dd1: 'III',
      dd2: 'III',
      dd3: 'IV',
    };
    const data = {
      checkedAspects: aspects,
      selectedLevels: levels,
      generalComments:
        'El monitoreo se desarrolló conforme a los compromisos de gestión. Se observa una adecuada planificación didáctica, alta concentración de alumnos en tareas significativas y un clima de aula respetuoso y participativo. Se recomienda continuar con las jornadas de reflexión interna.',
    };
    localStorage.setItem(`sistema-monitoreo:ficha-state:${visitId}`, JSON.stringify(data));
  };

  const handleSaveBorrador = (
    visitId: string,
    data: {
      checkedAspects: Record<string, boolean>;
      selectedLevels: Record<string, string>;
      generalComments: string;
    }
  ) => {
    localStorage.setItem(`sistema-monitoreo:ficha-state:${visitId}`, JSON.stringify(data));
    setCronogramas((prev) =>
      prev.map((c) => (c.id === visitId ? { ...c, estado: 'EN PROCESO' } : c))
    );
    setShowFichaModal(false);
  };

  const handleFinalizeMonitoreo = (
    visitId: string,
    data: {
      checkedAspects: Record<string, boolean>;
      selectedLevels: Record<string, string>;
      generalComments: string;
    }
  ) => {
    localStorage.setItem(`sistema-monitoreo:ficha-state:${visitId}`, JSON.stringify(data));
    setCronogramas((prev) =>
      prev.map((c) => (c.id === visitId ? { ...c, estado: 'COMPLETADO' } : c))
    );
    setShowFichaModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    deleteCronograma(deleteConfirmId);
    setDeleteConfirmId(null);
    setSelectedVisitId(null);
  };

  return (
    <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-5 shadow-sm relative transition-all duration-300 animate-in fade-in slide-in-from-right-5">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <span>Detalles del Cronograma</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Cerrar Detalles"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {selectedVisit ? (
        <div className="space-y-4">
          {visitsOnSelectedDate.length > 1 && (
            <div className="space-y-1.5 border-b border-border pb-3.5 mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Visitas del día ({visitsOnSelectedDate.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {visitsOnSelectedDate.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVisitId(v.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap border transition-all shadow-sm cursor-pointer ${
                      selectedVisitId === v.id
                        ? 'bg-primary text-white border-primary shadow'
                        : 'bg-surface text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Visita {v.nroVisita} ({v.especialistaInitials})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badge de Solicitud de Cambio Pendiente (Para el Jefe de Gestión) */}
          {activeRequest && activeRequest.estado === 'PENDIENTE' && !isEspecialista && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-start gap-2 shadow-sm animate-pulse">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600 mt-0.5 shrink-0" />
              <span>Solicitud de Reprogramación Pendiente</span>
            </div>
          )}

          <div className="flex justify-start">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${getVisitStatusBadgeClass(
                selectedVisit.estado
              )}`}
            >
              <span className={`h-2 w-2 rounded-full ${getVisitColorDot(selectedVisit.estado)}`}></span>
              {selectedVisit.estado}
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Institución Educativa
              </span>
              <div className="flex items-start gap-2 text-slate-800">
                <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm font-bold tracking-tight">{selectedVisit.institucion}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Especialista Responsable
              </span>
              <div className="flex items-start gap-2 text-slate-800">
                <div className="h-6 w-6 rounded-full bg-primary-light border border-primary/20 text-[10px] font-black text-primary flex items-center justify-center shrink-0 animate-pulse">
                  {selectedVisit.especialistaInitials}
                </div>
                <div className="text-sm font-semibold pt-0.5 leading-none">
                  {selectedVisit.especialista}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Docente / Directivo Evaluado
              </span>
              <div className="flex items-start gap-2 text-slate-800">
                <GraduationCap className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm font-medium">{selectedVisit.docenteDirectivo}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 my-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Fecha Programada
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>{formatVisitDate(selectedVisit.fechaHora)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Nº Visita
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                  <Hash className="h-4 w-4 text-primary shrink-0" />
                  <span>Visita {selectedVisit.nroVisita}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Modalidad
                </span>
                <div className="text-xs text-slate-700 font-medium">{selectedVisit.modalidad}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Nivel Educativo
                </span>
                <div className="text-xs text-slate-700 font-medium">{selectedVisit.nivel}</div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Detalles / Indicaciones
              </span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 shadow-inner leading-relaxed">
                {selectedVisit.observaciones || 'Sin indicaciones o detalles adicionales registrados.'}
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="space-y-2 pt-4 border-t border-border mt-6">
            {isEspecialista ? (
              <>
                {(selectedVisit.estado === 'PROGRAMADO' || selectedVisit.estado === 'EN PROCESO') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFichaModal(true)}
                      className="flex-1 justify-center border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-bold text-xs py-2.5 h-10 flex items-center gap-2 cursor-pointer"
                    >
                      <PlayCircle className="h-4.5 w-4.5" />
                      <span>
                        {selectedVisit.estado === 'PROGRAMADO' ? 'Iniciar Monitoreo' : 'Continuar Monitoreo'}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        if (activeRequest) {
                          setShowReprogramarModal(true);
                        } else {
                          setShowSolicitarReprogramarModal(true);
                        }
                      }}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-xs py-2.5 h-10 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      <span>{activeRequest ? 'Ver Solicitud' : 'Reprogramar'}</span>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {selectedVisit.estado === 'PROGRAMADO' && (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[11px] font-medium leading-relaxed flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
                      <Clock className="h-4.5 w-4.5 text-blue-500 mt-0.5 shrink-0" />
                      <span>
                        <strong>Visita Programada:</strong> Vista informativa. Solo el especialista asignado (
                        <strong>{selectedVisit.especialista}</strong>) tiene permisos para dar inicio al monitoreo.
                      </span>
                    </div>

                    {activeRequest && (
                      <Button
                        variant="outline"
                        onClick={() => setShowReprogramarModal(true)}
                        className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 h-10 flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin-hover" />
                        <span>Revisar Reprogramación ({activeRequest.estado})</span>
                      </Button>
                    )}
                  </div>
                )}

                {selectedVisit.estado === 'EN PROCESO' && (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-medium leading-relaxed flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
                      <PlayCircle className="h-4.5 w-4.5 text-rose-500 mt-0.5 shrink-0" />
                      <span>
                        <strong>En Proceso:</strong> El especialista asignado se encuentra ejecutando la visita de
                        monitoreo en la institución.
                      </span>
                    </div>

                    {activeRequest && (
                      <Button
                        variant="outline"
                        onClick={() => setShowReprogramarModal(true)}
                        className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 h-10 flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-primary" />
                        <span>Ver Solicitud de Cambio</span>
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {selectedVisit.estado === 'COMPLETADO' && (
              <div className="flex flex-col gap-2">
                <div className="text-center p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-inner">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Visita Realizada con Éxito</span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    const saved = localStorage.getItem(`sistema-monitoreo:ficha-state:${selectedVisit.id}`);
                    if (!saved) {
                      simulateFichaLlena(selectedVisit.id);
                    }
                    setShowFichaModal(true);
                  }}
                  className="w-full justify-center border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold py-2 cursor-pointer"
                >
                  Ver Ficha de Monitoreo Llena
                </Button>

                {activeRequest && (
                  <Button
                    variant="outline"
                    onClick={() => setShowReprogramarModal(true)}
                    className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 h-9 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-primary" />
                    <span>Ver Historial de Reprogramación</span>
                  </Button>
                )}
              </div>
            )}

            {selectedVisit.estado === 'REPROGRAMADO' && (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-amber-800 text-[11px] font-medium leading-relaxed flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>
                    <strong>Visita Reprogramada:</strong> La fecha original fue modificada. Se encuentra pendiente de
                    ser iniciada por el especialista en la nueva fecha.
                  </span>
                </div>

                {activeRequest && (
                  <Button
                    variant="outline"
                    onClick={() => setShowReprogramarModal(true)}
                    className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 h-9 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-primary" />
                    <span>Ver Detalle de Reprogramación</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
          <Calendar className="h-10 w-10 mb-2 stroke-1" />
          <span className="text-xs font-semibold">Selecciona un día en el calendario</span>
        </div>
      )}

      {/* Feature Modals rendered inside the widget */}
      {selectedVisit && activeTemplate && (
        <LlenarFichaForm
          isOpen={showFichaModal}
          onClose={() => setShowFichaModal(false)}
          visit={selectedVisit}
          template={activeTemplate}
          onSave={handleSaveBorrador}
          onFinalize={handleFinalizeMonitoreo}
        />
      )}

      {selectedVisit && (
        <SolicitarReprogramacionForm
          isOpen={showSolicitarReprogramarModal}
          onClose={() => setShowSolicitarReprogramarModal(false)}
          visit={selectedVisit}
          onSubmit={(data) => {
            submitRescheduleRequest(selectedVisit.id, {
              fechaOriginal: selectedVisit.fechaHora,
              fechaNueva: data.fechaNueva,
              motivo: data.motivo,
              archivoNombre: data.archivoNombre,
            });
            setShowSolicitarReprogramarModal(false);
          }}
        />
      )}

      {selectedVisit && activeRequest && (
        <DecidirReprogramacionForm
          isOpen={showReprogramarModal}
          onClose={() => setShowReprogramarModal(false)}
          visit={selectedVisit}
          request={activeRequest}
          isEspecialista={isEspecialista}
          onApprove={(visitId, comment) => {
            approveRescheduleRequest(
              visitId,
              user ? `${user.nombres} ${user.apellidos}` : 'Carlos Mendoza',
              comment
            );
            setShowReprogramarModal(false);
          }}
          onReject={(visitId, comment) => {
            rejectRescheduleRequest(
              visitId,
              user ? `${user.nombres} ${user.apellidos}` : 'Carlos Mendoza',
              comment
            );
            setShowReprogramarModal(false);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmModal
          title="¿Desea eliminar este cronograma?"
          message={
            <span>
              Esta acción eliminará de forma lógica el cronograma de visita programada para esta institución.
            </span>
          }
          confirmLabel="Eliminar Cronograma"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmId(null)}
          danger
        />
      )}
    </div>
  );
};
