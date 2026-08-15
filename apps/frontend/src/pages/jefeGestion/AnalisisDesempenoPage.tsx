import { useState, useMemo } from 'react';
import { useUser } from '@entities/model-user';
import { useFichasCompletadas } from '@entities/model-reportes';
import { useCronogramasData } from '@features/cronogramas/hooks/use-cronogramas-data';
import { useCan, Capability } from '@shared/auth';
import {
  reportesVisibles,
  type ReporteVisible,
} from '@features/reportes/lib/visibilidad-reportes';
import {
  calcularAnalisisDesempeno,
  normalizarNivelLogro,
} from '@features/reportes/lib/analisis-desempeno';
import { SubnavReportes } from '@/widgets/reportes/ui/SubnavReportes';
import { KpisDesempeno } from '@/widgets/reportes/ui/analisis/KpisDesempeno';
import { GraficoDistribucionNivel } from '@/widgets/reportes/ui/analisis/GraficoDistribucionNivel';
import { GraficoNivelEducativo } from '@/widgets/reportes/ui/analisis/GraficoNivelEducativo';
import { TablaDocentesRefuerzo } from '@/widgets/reportes/ui/analisis/TablaDocentesRefuerzo';
import { FiltrosAnalisis } from '@/widgets/reportes/ui/analisis/FiltrosAnalisis';
import type { BackendReportVisit } from '@/widgets/reportes';

export const AnalisisDesempenoPage = () => {
  const { user } = useUser();
  const { can } = useCan();

  const [filtroAnio, setFiltroAnio] = useState('ALL');
  const [filtroNivel, setFiltroNivel] = useState('ALL');
  const [filtroLogro, setFiltroLogro] = useState('ALL');

  const { data: fichasCompletadasData, isLoading } = useFichasCompletadas({
    limit: 1000,
    tipoMonitoreo: 'DOCENTE',
  });

  const { cronogramas, isLoading: cargandoCronogramas } = useCronogramasData(
    can(Capability.MONITOREO_READ),
  );

  const completedVisits = useMemo((): BackendReportVisit[] => {
    if (fichasCompletadasData?.data) {
      const list = fichasCompletadasData.data.map((f) => ({
        id: f.id,
        cronogramaId: f.cronogramaId,
        fechaHora: f.fechaProgramada || f.fechaEjecucion,
        tipo: (f.tipoMonitoreo === 'DOCENTE' ? 'DOCENTE' : 'DIRECTIVO') as 'DOCENTE' | 'DIRECTIVO',
        docenteDirectivo: f.evaluadoNombre,
        evaluadoId: f.evaluadoId,
        especialista: f.especialistaNombre,
        monitorId: f.especialistaId,
        institucion: `${f.institucionNombre} - ${f.institucionCodigoModular}`,
        institucionId: f.institucionId,
        modalidad: f.modalidad || 'EBR',
        nivel: f.nivel || 'Primaria',
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

  const aniosDisponibles = useMemo(() => {
    const set = new Set<string>();
    completedVisits.forEach((v) => {
      if (v.anioAcademico) set.add(String(v.anioAcademico));
      else if (v.fechaHora) set.add(new Date(v.fechaHora).getFullYear().toString());
    });
    return Array.from(set).sort().reverse();
  }, [completedVisits]);

  const nivelesDisponibles = useMemo(() => {
    const set = new Set<string>();
    completedVisits.forEach((v) => {
      if (v.nivel) set.add(v.nivel);
    });
    return Array.from(set).sort();
  }, [completedVisits]);

  const visitasFiltradas = useMemo(() => {
    return completedVisits.filter((v) => {
      if (filtroAnio !== 'ALL') {
        const anio = v.anioAcademico ? String(v.anioAcademico) : v.fechaHora?.split('-')[0];
        if (anio !== filtroAnio) return false;
      }

      if (filtroNivel !== 'ALL') {
        if (v.nivel !== filtroNivel) return false;
      }

      if (filtroLogro !== 'ALL') {
        const nivelNorm = normalizarNivelLogro(v.nivelLogro, v.promedio);
        if (nivelNorm !== filtroLogro) return false;
      }

      return true;
    });
  }, [completedVisits, filtroAnio, filtroNivel, filtroLogro]);

  const analisis = useMemo(
    () => calcularAnalisisDesempeno(visitasFiltradas),
    [visitasFiltradas],
  );

  const isFiltered = filtroAnio !== 'ALL' || filtroNivel !== 'ALL' || filtroLogro !== 'ALL';

  const handleLimpiarFiltros = () => {
    setFiltroAnio('ALL');
    setFiltroNivel('ALL');
    setFiltroLogro('ALL');
  };

  const cargando = isLoading && cargandoCronogramas;

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text">
            Reportes y Analítica Pedagógica
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Consolidado y diagnóstico de niveles de logro docente en el marco del monitoreo pedagógico.
          </p>
        </div>
      </div>

      {/* Subnavegación de Sección */}
      <SubnavReportes totalFichas={completedVisits.length} />

      {/* Filtros */}
      <FiltrosAnalisis
        filtroAnio={filtroAnio}
        setFiltroAnio={setFiltroAnio}
        filtroNivel={filtroNivel}
        setFiltroNivel={setFiltroNivel}
        filtroLogro={filtroLogro}
        setFiltroLogro={setFiltroLogro}
        aniosDisponibles={aniosDisponibles}
        nivelesDisponibles={nivelesDisponibles}
        onLimpiarFiltros={handleLimpiarFiltros}
        isFiltered={isFiltered}
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

          {/* Bloque 3: Tabla de Docentes en Foco de Reforzamiento */}
          <TablaDocentesRefuerzo docentes={analisis.docentesRefuerzo} />
        </>
      )}
    </div>
  );
};
