import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  User,
  Download,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { SelectField } from '@/shared/ui/form-controls';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';
import { usePlantillasList } from '@/entities/model-plantillas/use-plantillas-api';
import { LlenarFichaForm } from '@/features/monitoreos';
import { fichasApi } from '@/features/monitoreos/api/fichas.api';
import { reportesApi } from '@/shared/api/reportes.api';
import type { IPlantilla } from '@sistema-monitoreo/shared-contracts';

interface IFichaRespuestaDesempenoConPreguntaExtra {
  id: string;
  fichaId: string;
  desempenoId: string;
  nivel: number;
  observaciones: string | null;
  preguntaExtraRespuesta?: boolean;
}

export interface BackendReportVisit extends Cronograma {
  nivelLogro?: string;
  promedio?: number;
  puntajeTotal?: number;
}

interface ReportesGridProps {
  filteredVisits: BackendReportVisit[];
  viewMode: 'GRID' | 'TABLE';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterModalidad: string;
  setFilterModalidad: (m: string) => void;
  filterNivel: string;
  setFilterNivel: (n: string) => void;
  filterTipo: string;
  setFilterTipo: (t: string) => void;
  nivelesDisponibles: string[];
  isAnyFilterActive: boolean;
  handleClearFilters: () => void;
  plantillas: Plantilla[];
}

const MODALIDADES = ['EBR', 'EBA', 'EBE', 'CEPTRO'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getFichaState = (visitId: string) => {
  const saved = localStorage.getItem(`sistema-monitoreo:ficha-state:${visitId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.warn('Invalid JSON in localStorage', err);
    }
  }
  
  // Mock pre-filled state for completed mock visits
  const defaultComments = 'Se evidencia un óptimo desempeño de las actividades. El plan de trabajo institucional está alineado con las directrices de la UGEL. Se recomienda reforzar el acompañamiento en aula para asegurar la continuidad pedagógica e incrementar el monitoreo formativo.';
  const defaultAspects: Record<string, boolean> = {
    'd1_a1': true, 'd1_a2': true, 'd1_a3': true,
    'd2_a1': true, 'd2_a2': true, 'd2_a3': false,
    'd3_a1': true, 'd3_a2': true, 'd3_a3': true,
    'a1_1': true, 'a1_2': true, 'a1_3': true,
    'a2_1': true, 'a2_2': true, 'a2_3': true,
    'a3_1': true, 'a3_2': true, 'a3_3': false,
    'dd1_a1': true, 'dd1_a2': true, 'dd1_a3': true,
    'dd2_a1': true, 'dd2_a2': true, 'dd2_a3': true,
    'dd3_a1': true, 'dd3_a2': true, 'dd3_a3': true,
    'ad1_1': true, 'ad1_2': true, 'ad1_3': true,
    'ad2_1': true, 'ad2_2': true, 'ad2_3': true,
    'ad3_1': true, 'ad3_2': true, 'ad3_3': true,
  };
  
  const defaultLevels: Record<string, string> = {
    'd1': 'III', 'd2': 'III', 'd3': 'IV',
    'a1': 'III', 'a2': 'III', 'a3': 'IV',
    'dd1': 'III', 'dd2': 'III', 'dd3': 'IV',
    'ad1': 'III', 'ad2': 'III', 'ad3': 'IV',
  };
  
  return {
    checkedAspects: defaultAspects,
    selectedLevels: defaultLevels,
    generalComments: defaultComments
  };
};

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

export const ReportesGrid = ({
  filteredVisits,
  viewMode,
  searchQuery,
  setSearchQuery,
  filterModalidad,
  setFilterModalidad,
  filterNivel,
  setFilterNivel,
  filterTipo,
  setFilterTipo,
  nivelesDisponibles,
  isAnyFilterActive,
  handleClearFilters,
  plantillas,
}: ReportesGridProps) => {
  // Modal details
  const [selectedVisit, setSelectedVisit] = useState<BackendReportVisit | null>(null);
  const [showFichaModal, setShowFichaModal] = useState<boolean>(false);

  // PDF download mock triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: backendFicha } = useQuery({
    queryKey: ['ficha-completada', selectedVisit?.id],
    queryFn: () => {
      if (!selectedVisit) return null;
      const hasBackendData = 'nivelLogro' in selectedVisit;
      return hasBackendData
        ? fichasApi.findById(selectedVisit.id)
        : fichasApi.findByVisita(selectedVisit.id);
    },
    enabled: !!selectedVisit,
  });

  const { data: realPlantillas } = usePlantillasList();

  const allPlantillas = useMemo(() => {
    if (!realPlantillas || realPlantillas.length === 0) {
      return plantillas;
    }
    return realPlantillas.map((p: IPlantilla) => ({
      id: p.id,
      tipoMonitoreo: p.tipoMonitoreo === 'DOCENTE' ? 'Monitoreo Docente' : 'Monitoreo Directivo',
      anioAcademico: p.anioAcademico,
      baremo: p.baremo,
      descripcion: p.descripcion || '',
      estado: p.estado,
      fechaCreacion: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      creadoPorRole: p.rolAutorAlCrear,
      ieId: p.institucionId || undefined,
      niveles: p.niveles.map(n => ({
        nivel: n.nivelRomano,
        denominacion: n.denominacion,
        rangoMin: n.rangoMin,
        color: n.color
      })),
      desempenos: p.desempenos.map(d => ({
        id: d.id,
        nombre: d.nombre,
        descripcionCorta: d.descripcionCorta || '',
        preguntaExtra: d.preguntaExtra || '',
        aspectos: (d.aspectos || []).map(a => ({
          id: a.id,
          descripcion: a.descripcion
        })),
        rubrica: (d.rubrica || []).map(r => ({
          nivel: r.nivelRomano,
          descripcion: r.descripcion
        }))
      })),
      ejesItems: (p.ejesItems || []).map((item) => ({
        id: item.id,
        numero: item.numero,
        descripcion: item.descripcion,
      })),
    }));
  }, [realPlantillas, plantillas]);

  const activeTemplate = useMemo(() => {
    if (!selectedVisit) return null;
    const hasBackendData = 'nivelLogro' in selectedVisit;
    if (hasBackendData && backendFicha) {
      const match = allPlantillas.find((p) => p.id === backendFicha.plantillaId);
      if (match) return match;
    }
    const searchType = selectedVisit.tipo === 'DOCENTE' ? 'Monitoreo Docente' : 'Monitoreo Directivo';
    return allPlantillas.find((p) => p.tipoMonitoreo === searchType) || allPlantillas[0];
  }, [selectedVisit, backendFicha, allPlantillas]);

  const activeFichaState = useMemo(() => {
    if (!selectedVisit) return null;
    const hasBackendData = 'nivelLogro' in selectedVisit;

    if (hasBackendData && backendFicha) {
      const checkedAspects: Record<string, boolean> = {};
      (backendFicha.respuestasAspecto || []).forEach((ra) => {
        checkedAspects[ra.aspectoId] = true;
      });

      const selectedLevels: Record<string, string> = {};
      const numToRoman = ['', 'I', 'II', 'III', 'IV'];
      (backendFicha.respuestasDesempeno || []).forEach((rd) => {
        selectedLevels[rd.desempenoId] = numToRoman[rd.nivel] || 'I';
      });

      const preguntaExtraAnswers: Record<string, boolean> = {};
      (backendFicha.respuestasDesempeno || []).forEach((rd) => {
        const extraRes = (rd as IFichaRespuestaDesempenoConPreguntaExtra).preguntaExtraRespuesta;
        if (extraRes !== null && extraRes !== undefined) {
          preguntaExtraAnswers[rd.desempenoId] = extraRes;
        }
      });

      const respuestasEjeItem: Record<string, number> = {};
      const evidenciaUrls: Record<string, string> = {};
      (backendFicha.respuestasEjeItem || []).forEach((re) => {
        respuestasEjeItem[re.ejeItemId] = re.nivel;
        if (re.evidenciaUrl) {
          evidenciaUrls[re.ejeItemId] = re.evidenciaUrl;
        }
      });

      return {
        checkedAspects,
        selectedLevels,
        generalComments: backendFicha.observaciones || '',
        sugerencias: backendFicha.sugerencias || '',
        compromisos: backendFicha.compromisos || '',
        preguntaExtraAnswers,
        respuestasEjeItem,
        evidenciaUrls,
      };
    }

    return getFichaState(selectedVisit.id);
  }, [selectedVisit, backendFicha]);

  const handleDownloadPDF = (visit: BackendReportVisit, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasBackendData = 'nivelLogro' in visit;
    if (hasBackendData) {
      const exportUrl = reportesApi.fichaHTMLUrl(visit.id);
      window.open(exportUrl, '_blank');
      return;
    }

    setDownloadingId(visit.id);
    setTimeout(() => {
      setDownloadingId(null);
      setToastMessage(`Ficha de Monitoreo - ${visit.institucion.split(' - ')[0]} descargada con éxito en PDF.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Panel de Filtros */}
      <Card className="p-5 border border-border bg-surface shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filtros de Reporte</span>
          </div>
          {isAnyFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary-hover h-8 px-3 rounded-lg cursor-pointer"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pb-0.5">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="IE, especialista o docente..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs leading-none h-9 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <SelectField
            label="Modalidad"
            value={filterModalidad}
            onChange={(val) => setFilterModalidad(val)}
            placeholder="Todas las modalidades"
            options={[
              { value: 'Todos', label: 'Todas las modalidades' },
              ...MODALIDADES.map((m) => ({ value: m, label: m })),
            ]}
          />

          <SelectField
            label="Nivel Educativo"
            value={filterNivel}
            onChange={(val) => setFilterNivel(val)}
            disabled={filterModalidad === 'Todos'}
            placeholder="Todos los niveles"
            options={[
              { value: 'Todos', label: 'Todos los niveles' },
              ...nivelesDisponibles.map((n) => ({ value: n, label: n })),
            ]}
          />

          <SelectField
            label="Tipo de Ficha"
            value={filterTipo}
            onChange={(val) => setFilterTipo(val)}
            placeholder="Todos los tipos"
            options={[
              { value: 'Todos', label: 'Todos los tipos' },
              { value: 'DOCENTE', label: 'Docente (Acompañamiento en aula)' },
              { value: 'DIRECTIVO', label: 'Directivo (Gestión escolar)' },
            ]}
          />
        </div>
      </Card>

      {/* Listado Principal */}
      {filteredVisits.length > 0 ? (
        <>
          {viewMode === 'GRID' ? (
            /* Vista Cuadrícula */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVisits.map((visit) => {
                const fichaState = getFichaState(visit.id);
                const hasBackendData = visit.nivelLogro !== undefined;
                const totalAspects = hasBackendData ? 0 : Object.keys(fichaState.checkedAspects).length;
                const checkedCount = hasBackendData ? 0 : Object.values(fichaState.checkedAspects).filter(Boolean).length;
                
                const levelLogroMap: Record<string, string> = {
                  'INICIO': 'I',
                  'EN_PROCESO': 'II',
                  'LOGRO_ESPERADO': 'III',
                  'LOGRO_DESTACADO': 'IV'
                };
                const mostFrequentLevel = hasBackendData
                  ? (levelLogroMap[visit.nivelLogro || ''] || 'III')
                  : (() => {
                      const levels = Object.values(fichaState.selectedLevels) as string[];
                      return levels.length > 0
                        ? levels.reduce((a, b, _, arr) =>
                            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
                          )
                        : 'III';
                    })();

                return (
                  <Card
                    key={visit.id}
                    onClick={() => {
                      setSelectedVisit(visit);
                      setShowFichaModal(true);
                    }}
                    className="p-5 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all bg-surface flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{
                        backgroundColor: visit.tipo === 'DOCENTE' ? '#2563eb' : '#8b5cf6',
                      }}
                    />

                    <div className="space-y-3 pl-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[9px] font-bold text-slate-500 uppercase">
                          {visit.modalidad} - {visit.nivel}
                        </Badge>
                        <Badge
                          className={`font-black text-[9px] uppercase tracking-wider ${
                            visit.tipo === 'DOCENTE'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}
                        >
                          {visit.tipo === 'DOCENTE' ? 'DOCENTE' : 'DIRECTIVO'}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {visit.institucion}
                        </h3>
                        <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">Evaluado: {visit.docenteDirectivo}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">Esp: {visit.especialista}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>{hasBackendData ? 'Promedio / Puntaje:' : 'Aspectos Cumplidos:'}</span>
                          <span className="text-slate-800">
                            {hasBackendData
                              ? `Promedio ${(visit.promedio ?? 0).toFixed(2)} (${visit.puntajeTotal ?? 0} pts)`
                              : `${checkedCount} / ${totalAspects}`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${hasBackendData
                                ? ((visit.promedio ?? 0) / 4.0) * 100
                                : totalAspects > 0 ? (checkedCount / totalAspects) * 100 : 80}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pl-2 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="text-[9.5px] font-black border-slate-200 bg-slate-50 text-slate-700"
                        >
                          Logro: Nivel {mostFrequentLevel}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleDownloadPDF(visit, e)}
                          disabled={downloadingId === visit.id}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                          title="Descargar PDF"
                        >
                          {downloadingId === visit.id ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVisit(visit);
                            setShowFichaModal(true);
                          }}
                          className="text-[10px] font-bold border-slate-200 text-slate-600 h-8 px-2.5 rounded-lg flex items-center gap-1 bg-surface hover:bg-slate-50 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>Ver Ficha</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Vista Tabla */
            <Card className="border border-border bg-surface shadow-sm overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-5">I.E. / Institución</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Evaluado</th>
                      <th className="py-3 px-4">Especialista</th>
                      <th className="py-3 px-4">Fecha Cierre</th>
                      <th className="py-3 px-4">Aspectos</th>
                      <th className="py-3 px-4">Calificación</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredVisits.map((visit) => {
                      const fichaState = getFichaState(visit.id);
                      const hasBackendData = visit.nivelLogro !== undefined;
                      const totalAspects = hasBackendData ? 0 : Object.keys(fichaState.checkedAspects).length;
                      const checkedCount = hasBackendData ? 0 : Object.values(fichaState.checkedAspects).filter(Boolean).length;
                      
                      const levelLogroMap: Record<string, string> = {
                        'INICIO': 'I',
                        'EN_PROCESO': 'II',
                        'LOGRO_ESPERADO': 'III',
                        'LOGRO_DESTACADO': 'IV'
                      };
                      const mostFrequentLevel = hasBackendData
                        ? (levelLogroMap[visit.nivelLogro || ''] || 'III')
                        : (() => {
                            const levels = Object.values(fichaState.selectedLevels) as string[];
                            return levels.length > 0
                              ? levels.reduce((a, b, _, arr) =>
                                  arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
                                )
                              : 'III';
                          })();

                      return (
                        <tr
                          key={visit.id}
                          onClick={() => {
                            setSelectedVisit(visit);
                            setShowFichaModal(true);
                          }}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-5 font-bold text-slate-800 max-w-[200px] truncate">
                            {visit.institucion}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              className={`font-black text-[9px] uppercase tracking-wider ${
                                visit.tipo === 'DOCENTE'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-purple-50 text-purple-700 border-purple-100'
                              }`}
                            >
                              {visit.tipo}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            {visit.docenteDirectivo}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{visit.especialista}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-semibold">
                            {formatVisitDate(visit.fechaHora)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            {hasBackendData
                              ? `Prom. ${(visit.promedio ?? 0).toFixed(2)}`
                              : `${checkedCount} / ${totalAspects}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-black border-slate-200 bg-slate-50 text-slate-800"
                            >
                              Nivel {mostFrequentLevel}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div
                              className="flex justify-center items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedVisit(visit);
                                  setShowFichaModal(true);
                                }}
                                className="h-8 px-2 rounded-lg text-slate-600 border-slate-200 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span>Ver</span>
                              </Button>
                              <button
                                onClick={(e) => handleDownloadPDF(visit, e)}
                                disabled={downloadingId === visit.id}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                                title="Descargar PDF"
                              >
                                {downloadingId === visit.id ? (
                                  <Clock className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="text-center py-20 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto stroke-1.5 mb-3" />
          <h3 className="text-slate-700 font-bold text-sm">Sin reportes registrados</h3>
          <p className="text-text-muted text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
            No existen fichas de monitoreo completadas hasta el momento. Completa visitas en el calendario para poblar
            esta sección.
          </p>
        </Card>
      )}

      {selectedVisit && activeTemplate && activeFichaState && (
        <LlenarFichaForm
          isOpen={showFichaModal}
          onClose={() => {
            setShowFichaModal(false);
            setSelectedVisit(null);
          }}
          visit={selectedVisit}
          template={activeTemplate}
          initialState={activeFichaState}
        />
      )}
    </div>
  );
};
