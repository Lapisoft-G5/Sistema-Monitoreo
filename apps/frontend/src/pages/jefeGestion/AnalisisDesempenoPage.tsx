import { useState, useMemo } from 'react';
import { useUser } from '@entities/model-user';
import { useFichasCompletadas, useAnalisisDesempenos } from '@entities/model-reportes';
import { usePlantillasList } from '@entities/model-plantillas/use-plantillas-api';
import { useCronogramasData } from '@features/cronogramas/hooks/use-cronogramas-data';
import { useCan, useScope, Capability } from '@shared/auth';
import { PageHeader } from '@shared/ui/pageHeader';
import { MODALIDAD_NIVEL_MAP } from '@sistema-monitoreo/shared-contracts';
import {
  reportesVisibles,
  type ReporteVisible,
} from '@features/reportes/lib/visibilidad-reportes';
import {
  calcularAnalisisPorCriterios,
  type FiltroDeInstrumento,
} from '@features/reportes/lib/analisis-desempeno';
import { esInstrumentoEib, tipoDeVisitaDe } from '@features/reportes/lib/instrumento';
import { aniosDeFiltro } from '@features/reportes/lib/anios-de-filtro';
import {
  coincideConPeriodo,
  calcularConteosPorPeriodo,
  rangoDePeriodo,
  type FiltroPeriodoTipo,
} from '@features/reportes/lib/filtro-temporal';
import { FiltrosReportes } from '@/widgets/reportes/ui/grid/FiltrosReportes';
import { KpisCriterios } from '@/widgets/reportes/ui/analisis/KpisCriterios';
import { HistorialChart } from '@/features/monitoreos/ui/HistorialChart';
import { GraficoComparativoCriterios } from '@/widgets/reportes/ui/analisis/GraficoComparativoCriterios';
import { ListaCriteriosDesempeno } from '@/widgets/reportes/ui/analisis/ListaCriteriosDesempeno';
import type { BackendReportVisit } from '@/widgets/reportes';

/** El año en curso, que es donde arranca el análisis. */
const ANIO_ACTUAL = new Date().getFullYear();

export const AnalisisDesempenoPage = () => {
  const { user } = useUser();
  const { can } = useCan();
  const { isInstitution } = useScope();

  // El personal de una institución (director, coordinador pedagógico, jefe de
  // taller) mira siempre su propio colegio: Modalidad, Nivel e Institución no
  // varían, así que se precargan y se bloquean, y sólo mueve Docente (y
  // período/tipo/año). Además, cada uno ya trae sólo lo que le corresponde: el
  // director ve todo su colegio y el coordinador/jefe de taller sólo lo que él
  // mismo monitoreó (lo resuelve `reportesVisibles`).
  const esAmbitoDeUnaIE = isInstitution;

  // ── Estados de Filtros (Filtros de Reporte estándar) ──
  const [filterModalidad, setFilterModalidad] = useState('Todos');
  const [filterNivel, setFilterNivel] = useState('Todos');
  const [filterInstitucion, setFilterInstitucion] = useState('Todos');
  const [filterDocente, setFilterDocente] = useState('Todos');
  const [filterNumeroVisita, setFilterNumeroVisita] = useState('Todos');
  // Criterio al que se llegó desde un KPI (para resaltarlo en el detalle de abajo).
  const [criterioResaltado, setCriterioResaltado] = useState<string | null>(null);

  const irACriterio = (desempenoId: string) => {
    setCriterioResaltado(desempenoId);
    document
      .getElementById(`criterio-${desempenoId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // El resaltado es momentáneo: sólo para guiar la vista, no un estado pegado.
    window.setTimeout(
      () => setCriterioResaltado((actual) => (actual === desempenoId ? null : actual)),
      2500,
    );
  };
  /**
   * El análisis siempre mira un año concreto.
   *
   * Sus criterios los define la plantilla vigente de ese año, y las plantillas
   * cambian de un año a otro: agregarlos pondría criterios distintos en el
   * mismo eje, uno al lado del otro, como si fueran comparables.
   */
  const [filterAnio, setFilterAnio] = useState(String(ANIO_ACTUAL));
  // Tipado: el analisis segmenta por instrumento, no por una cadena libre.
  // El análisis por criterio es por instrumento: mezclar tipos pone rúbricas con
  // distinta cantidad de criterios en el mismo eje. Por eso no hay «Todos» acá y
  // arranca en el docente regular.
  const [filterTipo, setFilterTipo] = useState<FiltroDeInstrumento>('DOCENTE');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodoTipo>('TODOS');

  // Datos
  // Esta pantalla siempre tiene un año elegido: no ofrece «Todos los años».
  const anioNumero = parseInt(filterAnio, 10);
  // El backend filtra por `plantilla.tipoMonitoreo`, o sea el INSTRUMENTO. El
  // parámetro conserva su nombre en el cable; lo que se corrige es el tipo,
  // que decía `TipoMonitoreo` y por lo tanto excluía DOCENTE_EIB.
  const tipoMonitoreoParam = filterTipo !== 'Todos' ? filterTipo : undefined;

  // El período (Hoy/Semana/Mes) se traduce a un rango de fechas para el backend,
  // con los mismos límites que las píldoras, así el conteo del análisis coincide.
  const rangoPeriodo = useMemo(() => rangoDePeriodo(filtroPeriodo), [filtroPeriodo]);

  // Los filtros se aplican en el backend, que es quien arma la distribución por
  // criterio: de nada sirve filtrarlos sólo en el cliente porque el análisis no
  // se recalcula de las fichas, viene consolidado del servidor.
  const { data: criteriosBackend } = useAnalisisDesempenos({
    anioAcademico: anioNumero,
    tipoMonitoreo: tipoMonitoreoParam,
    modalidad: filterModalidad !== 'Todos' ? filterModalidad : undefined,
    nivelEducativo: filterNivel !== 'Todos' ? filterNivel : undefined,
    institucionId: filterInstitucion !== 'Todos' ? filterInstitucion : undefined,
    docenteId: filterDocente !== 'Todos' ? filterDocente : undefined,
    numeroVisita: filterNumeroVisita !== 'Todos' ? Number(filterNumeroVisita) : undefined,
    fechaDesde: rangoPeriodo.fechaDesde,
    fechaHasta: rangoPeriodo.fechaHasta,
  });

  // El catálogo de plantillas y el cronograma salen de endpoints de gestión que
  // exigen `monitoreo:execute` (no `:read`). Un actor con sólo lectura —p. ej. un
  // Jefe de Área sin cargo de monitoreo— llega a esta pantalla por su permiso de
  // reportes; pedir esos datos solo produce 403 de fondo. El análisis se arma con
  // `criteriosBackend` y `fichasCompletadas`, que ese actor sí puede leer.
  const puedeVerGestion = can(Capability.MONITOREO_EXECUTE);

  const { data: plantillas = [] } = usePlantillasList(undefined, { enabled: puedeVerGestion });

  const { data: fichasCompletadasData, isLoading } = useFichasCompletadas({
    limit: 1000,
  });

  const { cronogramas, isLoading: cargandoCronogramas } = useCronogramasData(puedeVerGestion);

  const completedVisits = useMemo((): BackendReportVisit[] => {
    if (fichasCompletadasData?.data && fichasCompletadasData.data.length > 0) {
      const list = fichasCompletadasData.data.map((f) => ({
        id: f.id,
        cronogramaId: f.cronogramaId,
        plantillaId: f.plantillaId,
        plantillaNombre: f.plantillaNombre,
        fechaHora: f.fechaEjecucion || f.fechaProgramada,
        // `tipo` es a quien se monitorea; `instrumento`, con que ficha.
        instrumento: f.instrumento,
        tipo: tipoDeVisitaDe(f.instrumento),
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
        nroVisita: String(f.numeroVisita ?? 1),
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

    const completadas = cronogramas.filter((c) => c.estado === 'COMPLETADO');
    return reportesVisibles(completadas as ReporteVisible[], user) as BackendReportVisit[];
  }, [fichasCompletadasData, cronogramas, user]);

  // Ámbito único del usuario de institución: como sus fichas visibles son de su
  // IE, la modalidad, el nivel y la institución salen de los propios datos. Sólo
  // se fija lo que es único (una IE integrada puede tener más de un nivel, o un
  // monitor puede haber visitado varios: ahí se deja «Todos»).
  const ambitoDeLaIE = useMemo(() => {
    if (!esAmbitoDeUnaIE) return null;
    const modalidades = new Set(completedVisits.map((v) => v.modalidad).filter(Boolean));
    const niveles = new Set(completedVisits.map((v) => v.nivel).filter(Boolean));
    const instituciones = new Set(completedVisits.map((v) => v.institucionId).filter(Boolean));
    return {
      modalidad: modalidades.size === 1 ? [...modalidades][0] : null,
      nivel: niveles.size === 1 ? [...niveles][0] : null,
      institucionId: instituciones.size === 1 ? [...instituciones][0] : null,
    };
  }, [esAmbitoDeUnaIE, completedVisits]);

  // Valores efectivos del ámbito: para el personal de institución mandan los de
  // su IE (no un estado que haya que sincronizar por efecto); para el resto, el
  // filtro elegido.
  const filterModalidadEf = ambitoDeLaIE?.modalidad ?? filterModalidad;
  const filterNivelEf = ambitoDeLaIE?.nivel ?? filterNivel;
  const filterInstitucionEf = ambitoDeLaIE?.institucionId ?? filterInstitucion;

  // Cascading Nivel
  const nivelesDisponibles = useMemo(() => {
    if (filterModalidadEf === 'Todos') return [];
    return MODALIDAD_NIVEL_MAP[filterModalidadEf as keyof typeof MODALIDAD_NIVEL_MAP] || [];
  }, [filterModalidadEf]);

  const handleModalidadChange = (modalidad: string) => {
    setFilterModalidad(modalidad);
    // Cambiar de modalidad reinicia lo que depende de ella: nivel, institución y docente.
    setFilterNivel('Todos');
    setFilterInstitucion('Todos');
    setFilterDocente('Todos');
  };

  const handleNivelChange = (nivel: string) => {
    setFilterNivel(nivel);
    // Cada nivel tiene sus propias instituciones y docentes: se reinician.
    setFilterInstitucion('Todos');
    setFilterDocente('Todos');
  };

  const handleInstitucionChange = (institucionId: string) => {
    setFilterInstitucion(institucionId);
    // Cada institución tiene sus propios docentes: al cambiarla, se reinicia.
    setFilterDocente('Todos');
  };

  // Instituciones que aparecen en los datos, acotadas por modalidad/nivel: cada
  // nivel y cada institución tienen sus propios docentes, así el selector cascada.
  const institucionesDisponibles = useMemo(() => {
    const porId = new Map<string, string>();
    completedVisits.forEach((v) => {
      if (filterModalidadEf !== 'Todos' && v.modalidad !== filterModalidadEf) return;
      if (filterNivelEf !== 'Todos' && v.nivel !== filterNivelEf) return;
      if (v.institucionId) porId.set(v.institucionId, v.institucion);
    });
    return [...porId.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [completedVisits, filterModalidadEf, filterNivelEf]);

  // Docentes que aparecen en los datos, acotados por modalidad/nivel/institución:
  // cada institución tiene sus propios docentes, así el selector cascada.
  const docentesDisponibles = useMemo(() => {
    const porId = new Map<string, string>();
    completedVisits.forEach((v) => {
      if (filterModalidadEf !== 'Todos' && v.modalidad !== filterModalidadEf) return;
      if (filterNivelEf !== 'Todos' && v.nivel !== filterNivelEf) return;
      if (filterInstitucionEf !== 'Todos' && v.institucionId !== filterInstitucionEf) return;
      if (v.evaluadoId) porId.set(v.evaluadoId, v.docenteDirectivo);
    });
    return [...porId.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [completedVisits, filterModalidadEf, filterNivelEf, filterInstitucionEf]);

  // Números de visita presentes en los datos (1er monitoreo, 2do, …), acotados
  // por el resto de los filtros.
  const numerosDeVisitaDisponibles = useMemo(() => {
    const nums = new Set<number>();
    completedVisits.forEach((v) => {
      if (filterModalidadEf !== 'Todos' && v.modalidad !== filterModalidadEf) return;
      if (filterNivelEf !== 'Todos' && v.nivel !== filterNivelEf) return;
      if (filterInstitucionEf !== 'Todos' && v.institucionId !== filterInstitucionEf) return;
      if (filterDocente !== 'Todos' && v.evaluadoId !== filterDocente) return;
      const n = Number(v.nroVisita);
      if (Number.isFinite(n) && n > 0) nums.add(n);
    });
    return [...nums].sort((a, b) => a - b);
  }, [completedVisits, filterModalidadEf, filterNivelEf, filterInstitucionEf, filterDocente]);

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
    // El año en curso siempre se ofrece, tenga fichas o no: el filtro arranca ahí.
    return aniosDeFiltro([...yearsSet], ANIO_ACTUAL);
  }, [completedVisits]);

  const conteosPeriodo = useMemo(
    () => calcularConteosPorPeriodo(completedVisits),
    [completedVisits],
  );

  const conteosTipo = useMemo(() => {
    let docentes = 0;
    let docentesEib = 0;
    let directivos = 0;
    completedVisits.forEach((v) => {
      if (v.instrumento === 'DIRECTIVO') directivos++;
      else if (esInstrumentoEib(v.instrumento)) docentesEib++;
      else docentes++;
    });
    return {
      Todos: completedVisits.length,
      DOCENTE: docentes,
      DOCENTE_EIB: docentesEib,
      DIRECTIVO: directivos,
    };
  }, [completedVisits]);

  const isAnyFilterActive =
    filterModalidad !== 'Todos' ||
    filterNivel !== 'Todos' ||
    filterInstitucion !== 'Todos' ||
    filterDocente !== 'Todos' ||
    filterNumeroVisita !== 'Todos' ||
    filterAnio !== String(ANIO_ACTUAL) ||
    filterTipo !== 'DOCENTE' ||
    filtroPeriodo !== 'TODOS';

  const handleClearFilters = () => {
    setFilterModalidad('Todos');
    setFilterNivel('Todos');
    setFilterInstitucion('Todos');
    setFilterDocente('Todos');
    setFilterNumeroVisita('Todos');
    setFilterAnio(String(ANIO_ACTUAL));
    setFilterTipo('DOCENTE');
    setFiltroPeriodo('TODOS');
  };

  const visitasFiltradas = useMemo(() => {
    return completedVisits.filter((visit) => {
      // Filtro de período temporal (Hoy, Esta semana, Este mes, Todos)
      if (!coincideConPeriodo(visit.fechaHora, filtroPeriodo)) return false;

      // El filtro es por instrumento, que es lo que el analisis segmenta.
      if (filterTipo !== 'Todos' && (visit.instrumento ?? 'DOCENTE') !== filterTipo) {
        return false;
      }

      if (filterModalidadEf !== 'Todos' && visit.modalidad !== filterModalidadEf) return false;
      if (filterNivelEf !== 'Todos' && visit.nivel !== filterNivelEf) return false;
      if (filterInstitucionEf !== 'Todos' && visit.institucionId !== filterInstitucionEf) return false;
      if (filterDocente !== 'Todos' && visit.evaluadoId !== filterDocente) return false;
      if (filterNumeroVisita !== 'Todos' && String(visit.nroVisita) !== filterNumeroVisita) return false;

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
  }, [completedVisits, filtroPeriodo, filterTipo, filterModalidadEf, filterNivelEf, filterInstitucionEf, filterDocente, filterNumeroVisita, filterAnio]);

  const analisis = useMemo(
    () => calcularAnalisisPorCriterios(criteriosBackend, visitasFiltradas, plantillas, filterTipo),
    [criteriosBackend, visitasFiltradas, plantillas, filterTipo],
  );

  const cargando = isLoading && cargandoCronogramas;
  const esDirectivo = filterTipo === 'DIRECTIVO';
  const esEib = filterTipo === 'DOCENTE_EIB';

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <PageHeader
        title={`Análisis de Desempeño ${
          esDirectivo ? '(Directivo)' : esEib ? '(Docente EIB)' : '(Docente)'
        }`}
        description={`Diagnóstico y distribución estadística de los niveles de logro obtenidos en los criterios y desempeños de ${
          esDirectivo ? 'gestión directiva institucional' : 'observación de práctica docente'
        }.`}
      />

      {/* ── Filtros de Reporte (Estándar con Tipo de Monitoreo) ── */}
      <FiltrosReportes
        filterModalidad={filterModalidadEf}
        setFilterModalidad={handleModalidadChange}
        filterNivel={filterNivelEf}
        setFilterNivel={handleNivelChange}
        filterInstitucion={filterInstitucionEf}
        setFilterInstitucion={handleInstitucionChange}
        institucionesDisponibles={institucionesDisponibles}
        filterDocente={filterDocente}
        setFilterDocente={setFilterDocente}
        docentesDisponibles={docentesDisponibles}
        filterNumeroVisita={filterNumeroVisita}
        setFilterNumeroVisita={setFilterNumeroVisita}
        numerosDeVisitaDisponibles={numerosDeVisitaDisponibles}
        filterAnio={filterAnio}
        setFilterAnio={setFilterAnio}
        permitirTodosLosAnios={false}
        permitirTipoTodos={false}
        bloquearAmbito={esAmbitoDeUnaIE}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        conteosTipo={conteosTipo}
        filtroPeriodo={filtroPeriodo}
        setFiltroPeriodo={setFiltroPeriodo}
        conteosPeriodo={conteosPeriodo}
        nivelesDisponibles={nivelesDisponibles}
        añosDisponibles={añosDisponibles}
        isAnyFilterActive={isAnyFilterActive}
        handleClearFilters={handleClearFilters}
        isEvaluatedView={false}
      />

      {/* Al elegir un docente/directivo, su historial pedagógico: la evolución de
          su desempeño a lo largo de los monitoreos (el promedio ya está en los KPIs). */}
      {filterDocente !== 'Todos' && (
        <div className="p-5 bg-surface border border-border rounded-2xl shadow-xs">
          <HistorialChart evaluadoId={filterDocente} />
        </div>
      )}

      {cargando ? (
        <div className="h-64 flex items-center justify-center text-xs text-text-muted">
          Cargando análisis de desempeño...
        </div>
      ) : completedVisits.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl shadow-xs">
          <h3 className="text-base font-bold text-slate-800">Sin datos de monitoreo disponibles</h3>
          <p className="text-xs text-text-muted mt-1">
            Aún no se han completado fichas de monitoreo para generar las estadísticas por criterio.
          </p>
        </div>
      ) : /**
         * El desglose por criterio lo resuelve el backend leyendo las respuestas
         * de cada desempeño. Cuando no llega, este análisis no se puede calcular:
         * el nivel de logro global de una ficha no dice en qué criterio le fue
         * bien. Antes se dibujaba una distribución inventada; ahora se declara.
         *
         * El estado vacío de arriba no alcanza porque mira el total SIN filtrar:
         * con el filtro puesto en un instrumento que todavía no tiene fichas
         * finalizadas, había fichas en el sistema y se caía igual acá.
         */
      analisis.sinDesglosePorCriterio ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl shadow-xs">
          <h3 className="text-base font-bold text-slate-800">
            Análisis por criterio no disponible
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-lg mx-auto">
            {analisis.totalEvaluaciones === 0
              ? 'No hay fichas finalizadas que coincidan con los filtros seleccionados.'
              : `Se encontraron ${analisis.totalEvaluaciones} fichas con estos filtros, pero todavía no hay respuestas por criterio registradas para consolidar la distribución de niveles.`}
          </p>
          {analisis.criterios.length > 0 && (
            <div className="mt-6 text-left max-w-lg mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Criterios del instrumento
              </span>
              <ul className="mt-2 space-y-1.5">
                {analisis.criterios.map((criterio) => (
                  <li
                    key={criterio.desempenoId}
                    className="text-xs text-slate-600 flex items-start gap-2"
                  >
                    <span className="font-bold text-slate-400 shrink-0">{criterio.orden}.</span>
                    <span>{criterio.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Bloque 1: KPIs Principales por Criterio */}
          <KpisCriterios analisis={analisis} onIrACriterio={irACriterio} />

          {/* Bloque 2: Gráfico Comparativo de Niveles por Desempeño */}
          <GraficoComparativoCriterios criterios={analisis.criterios} />

          {/* Bloque 3: Detalle en Tarjetas por cada Desempeño / Criterio */}
          <ListaCriteriosDesempeno criterios={analisis.criterios} resaltadoId={criterioResaltado} />
        </>
      )}
    </div>
  );
};
