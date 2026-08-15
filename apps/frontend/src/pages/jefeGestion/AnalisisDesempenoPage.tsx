import { useState, useMemo } from 'react';
import { useUser } from '@entities/model-user';
import { useFichasCompletadas } from '@entities/model-reportes';
import { useCronogramasData } from '@features/cronogramas/hooks/use-cronogramas-data';
import { useCan, Capability } from '@shared/auth';
import { PageHeader } from '@shared/ui/pageHeader';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';
import {
  reportesVisibles,
  type ReporteVisible,
} from '@features/reportes/lib/visibilidad-reportes';
import { calcularAnalisisDesempeno } from '@features/reportes/lib/analisis-desempeno';
import {
  coincideConPeriodo,
  calcularConteosPorPeriodo,
  type FiltroPeriodoTipo,
} from '@features/reportes/lib/filtro-temporal';
import { FiltrosReportes } from '@/widgets/reportes/ui/grid/FiltrosReportes';
import { KpisDesempeno } from '@/widgets/reportes/ui/analisis/KpisDesempeno';
import { GraficoDistribucionNivel } from '@/widgets/reportes/ui/analisis/GraficoDistribucionNivel';
import { GraficoNivelEducativo } from '@/widgets/reportes/ui/analisis/GraficoNivelEducativo';
import type { BackendReportVisit } from '@/widgets/reportes';

export const AnalisisDesempenoPage = () => {
  const { user } = useUser();
  const { can } = useCan();

  // ── Estados de Filtros (Filtros de Reporte estándar) ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('Todos');
  const [filterNivel, setFilterNivel] = useState('Todos');
  const [filterAnio, setFilterAnio] = useState('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodoTipo>('TODOS');

  // Datos
  const { data: fichasCompletadasData, isLoading } = useFichasCompletadas({
    limit: 1000,
    tipoMonitoreo: 'DOCENTE',
  });

  const { cronogramas, isLoading: cargandoCronogramas } = useCronogramasData(
    can(Capability.MONITOREO_READ),
  );

  const completedVisits = useMemo((): BackendReportVisit[] => {
    if (fichasCompletadasData?.data && fichasCompletadasData.data.length > 0) {
      const list = fichasCompletadasData.data.map((f) => ({
        id: f.id,
        cronogramaId: f.cronogramaId,
        fechaHora: f.fechaEjecucion || f.fechaProgramada,
        tipo: (f.tipoMonitoreo === 'DOCENTE' ? 'DOCENTE' : 'DIRECTIVO') as 'DOCENTE' | 'DIRECTIVO',
        docenteDirectivo: f.evaluadoNombre,
        evaluadoId: f.evaluadoId,
        especialista: f.especialistaNombre,
        especialistaInitials: f.especialistaNombre
          .split(' ')
          .map((n) => n[0] || '')
          .join('')
          .toUpperCase(),
        monitorId: f.especialistaId,
        institucion: `${f.institucionNombre} - ${f.institucionCodigoModular}`,
        institucionId: f.institucionId,
        modalidad: f.modalidad || 'EBR',
        nivel: f.nivel || 'Primaria',
        nroVisita: '1',
        estado: 'COMPLETADO' as const,
        nivelLogro: f.nivelLogro,
        promedio: f.promedio,
        puntajeTotal: f.puntajeTotal,
        correoEnviado: f.correoEnviado,
        horaInicio: f.horaInicio,
        horaFin: f.horaFin,
        anioAcademico: f.anioAcademico,
      }));
      return reportesVisibles(list as ReporteVisible[], user) as BackendReportVisit[];
    }

    const completadas = cronogramas.filter((c) => c.estado === 'COMPLETADO' && c.tipo === 'DOCENTE');
    return reportesVisibles(completadas as ReporteVisible[], user) as BackendReportVisit[];
  }, [fichasCompletadasData, cronogramas, user]);

  // Cascading Nivel
  const nivelesDisponibles = useMemo(() => {
    if (filterModalidad === 'Todos') return [];
    return MODALIDAD_NIVEL_MAP[filterModalidad as keyof typeof MODALIDAD_NIVEL_MAP] || [];
  }, [filterModalidad]);

  const handleModalidadChange = (modalidad: string) => {
    setFilterModalidad(modalidad);
    setFilterNivel('Todos');
  };

  const añosDisponibles = useMemo(() => {
    const yearsSet = new Set<string>();
    completedVisits.forEach((v) => {
      try {
        const d = new Date(v.fechaHora);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear().toString());
        } else {
          const yearPart = v.fechaHora?.split('-')[0];
          if (yearPart && yearPart.length === 4 && !isNaN(Number(yearPart))) {
            yearsSet.add(yearPart);
          }
        }
      } catch {
        // ignore
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [completedVisits]);

  const conteosPeriodo = useMemo(
    () => calcularConteosPorPeriodo(completedVisits),
    [completedVisits],
  );

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    filterModalidad !== 'Todos' ||
    filterNivel !== 'Todos' ||
    filterAnio !== 'Todos' ||
    filtroPeriodo !== 'TODOS';

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterModalidad('Todos');
    setFilterNivel('Todos');
    setFilterAnio('Todos');
    setFiltroPeriodo('TODOS');
  };

  const visitasFiltradas = useMemo(() => {
    return completedVisits.filter((visit) => {
      // Filtro de período temporal (Hoy, Esta semana, Este mes, Todos)
      if (!coincideConPeriodo(visit.fechaHora, filtroPeriodo)) return false;

      // Búsqueda por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchIE = visit.institucion.toLowerCase().includes(query);
        const matchDocente = visit.docenteDirectivo.toLowerCase().includes(query);
        const matchEspecialista = visit.especialista.toLowerCase().includes(query);
        if (!matchIE && !matchDocente && !matchEspecialista) return false;
      }

      if (filterModalidad !== 'Todos' && visit.modalidad !== filterModalidad) return false;
      if (filterNivel !== 'Todos' && visit.nivel !== filterNivel) return false;

      if (filterAnio !== 'Todos') {
        let visitYear = '';
        try {
          const d = new Date(visit.fechaHora);
          if (!isNaN(d.getTime())) {
            visitYear = d.getFullYear().toString();
          } else {
            const yearPart = visit.fechaHora?.split('-')[0];
            if (yearPart && yearPart.length === 4 && !isNaN(Number(yearPart))) {
              visitYear = yearPart;
            }
          }
        } catch {
          // ignore
        }
        if (visitYear !== filterAnio) return false;
      }

      return true;
    });
  }, [completedVisits, filtroPeriodo, searchQuery, filterModalidad, filterNivel, filterAnio]);

  const analisis = useMemo(
    () => calcularAnalisisDesempeno(visitasFiltradas),
    [visitasFiltradas],
  );

  const cargando = isLoading && cargandoCronogramas;

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <PageHeader
        title="Análisis de Desempeño"
        description="Diagnóstico y distribución estadística de los niveles de logro obtenidos en el monitoreo pedagógico."
      />

      {/* ── Filtros de Reporte (Estándar) ── */}
      <FiltrosReportes
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterModalidad={filterModalidad}
        setFilterModalidad={handleModalidadChange}
        filterNivel={filterNivel}
        setFilterNivel={setFilterNivel}
        filterAnio={filterAnio}
        setFilterAnio={setFilterAnio}
        filtroPeriodo={filtroPeriodo}
        setFiltroPeriodo={setFiltroPeriodo}
        conteosPeriodo={conteosPeriodo}
        nivelesDisponibles={nivelesDisponibles}
        añosDisponibles={añosDisponibles}
        isAnyFilterActive={isAnyFilterActive}
        handleClearFilters={handleClearFilters}
        isEvaluatedView={false}
      />

      {cargando ? (
        <div className="h-64 flex items-center justify-center text-xs text-text-muted">
          Cargando análisis de desempeño...
        </div>
      ) : completedVisits.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl shadow-xs">
          <h3 className="text-base font-bold text-slate-800">Sin datos de monitoreo disponibles</h3>
          <p className="text-xs text-text-muted mt-1">
            Aún no se han completado fichas de monitoreo docente para generar las estadísticas.
          </p>
        </div>
      ) : (
        <>
          {/* Bloque 1: KPIs Principales */}
          <KpisDesempeno analisis={analisis} />

          {/* Bloque 2: Gráficos de Distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoDistribucionNivel analisis={analisis} />
            <GraficoNivelEducativo analisis={analisis} />
          </div>
        </>
      )}
    </div>
  );
};
