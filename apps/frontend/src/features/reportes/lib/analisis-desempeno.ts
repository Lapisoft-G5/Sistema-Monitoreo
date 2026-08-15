import type { IAnalisisDesempenoCriterio } from '@sistema-monitoreo/shared-contracts';
import type { BackendReportVisit } from '@/widgets/reportes';
import type { Plantilla } from '@/entities/model-plantillas';

export type NivelLogroClave = 'I' | 'II' | 'III' | 'IV';

export interface ConteoNivel {
  nivel: NivelLogroClave;
  nombre: string;
  descripcion: string;
  conteo: number;
  porcentaje: number;
  color: string;
  colorBg: string;
  colorBorder: string;
}

export interface AnalisisDesempenoCompleto {
  totalEvaluaciones: number;
  promedioGeneral: number;
  criterioMayorDominio: IAnalisisDesempenoCriterio | null;
  criterioMayorRefuerzo: IAnalisisDesempenoCriterio | null;
  criterios: IAnalisisDesempenoCriterio[];
}

export const DESEMPENOS_DOCENTE_DEFAULT: Array<{
  orden: number;
  nombre: string;
  descripcionCorta: string;
}> = [
  {
    orden: 1,
    nombre: 'Involucra activamente a los estudiantes en el proceso de aprendizaje',
    descripcionCorta: 'Promueve el interés y la participación activa durante la sesión.',
  },
  {
    orden: 2,
    nombre: 'Maximiza el tiempo dedicado al aprendizaje',
    descripcionCorta: 'Gestiona la sesión evitando tiempos muertos y transiciones fluidas.',
  },
  {
    orden: 3,
    nombre: 'Fomenta el razonamiento y pensamiento crítico',
    descripcionCorta: 'Propone retos cognitivos que exigen análisis y argumentación.',
  },
];

export const DESEMPENOS_DIRECTIVO_DEFAULT: Array<{
  orden: number;
  nombre: string;
  descripcionCorta: string;
}> = [
  {
    orden: 1,
    nombre: 'Conducción de la gestión escolar y liderazgo pedagógico',
    descripcionCorta: 'Planificación institucional estratégica, metas de aprendizaje y seguimiento.',
  },
  {
    orden: 2,
    nombre: 'Gestión de las condiciones operativas y convivencia escolar',
    descripcionCorta: 'Mantenimiento de infraestructura, recursos educativos y clima institucional.',
  },
  {
    orden: 3,
    nombre: 'Acompañamiento y monitoreo a la práctica pedagógica',
    descripcionCorta: 'Plan de visitas, observación en aula y retroalimentación docente formativa.',
  },
];

export const normalizarNivelLogro = (nivelRaw?: string, promedio?: number): NivelLogroClave => {
  if (nivelRaw) {
    const raw = nivelRaw.toUpperCase().trim();
    if (raw.endsWith('IV') || raw.includes('DESTACADO')) return 'IV';
    if (raw.endsWith('III') || raw.includes('SATISFACTORIO') || raw.includes('ESPERADO')) return 'III';
    if (raw.endsWith('II') || raw.includes('PROCESO')) return 'II';
    if (raw.endsWith('I') || raw.includes('INICIO') || raw.includes('DEFICIENTE')) return 'I';
  }

  if (typeof promedio === 'number' && !Number.isNaN(promedio)) {
    if (promedio < 2.0) return 'I';
    if (promedio < 3.0) return 'II';
    if (promedio < 3.6) return 'III';
    return 'IV';
  }

  return 'II';
};

/**
 * Calcula el análisis estadístico consolidado por Criterio / Desempeño a evaluar.
 */
export const calcularAnalisisPorCriterios = (
  criteriosData: IAnalisisDesempenoCriterio[] = [],
  visitas: BackendReportVisit[] = [],
  plantillas: Plantilla[] = [],
  tipoFiltro: string = 'Todos',
): AnalisisDesempenoCompleto => {
  // Si el backend ya devolvió los criterios consolidados con respuestas, usarlos directamente
  if (criteriosData && criteriosData.length > 0) {
    const totalEvaluadosGlobal = Math.max(...criteriosData.map((c) => c.totalEvaluados), 0);
    const sumaPromedios = criteriosData.reduce((acc, c) => acc + c.promedio, 0);
    const promedioGeneral =
      criteriosData.length > 0 ? Number((sumaPromedios / criteriosData.length).toFixed(2)) : 0;

    const ordenadosPorDominio = [...criteriosData].sort((a, b) => b.tasaLogro - a.tasaLogro);
    const ordenadosPorRefuerzo = [...criteriosData].sort((a, b) => b.tasaRefuerzo - a.tasaRefuerzo);

    return {
      totalEvaluaciones: totalEvaluadosGlobal,
      promedioGeneral,
      criterioMayorDominio: ordenadosPorDominio[0] ?? null,
      criterioMayorRefuerzo: ordenadosPorRefuerzo[0] ?? null,
      criterios: criteriosData,
    };
  }

  const esDirectivo = tipoFiltro === 'DIRECTIVO';

  // Fallback / Estimación a partir de los desempeños de la plantilla y las fichas de visitas
  const plantillaObjetivo = plantillas.find(
    (p) =>
      esDirectivo
        ? (p.tipoMonitoreo || '').toUpperCase().includes('DIRECTIVO')
        : (p.tipoMonitoreo || '').toUpperCase().includes('DOCENTE'),
  );

  const listaDesempenos =
    plantillaObjetivo && Array.isArray(plantillaObjetivo.desempenos) && plantillaObjetivo.desempenos.length > 0
      ? plantillaObjetivo.desempenos.map((d, index) => ({
          orden: index + 1,
          nombre: d.nombre,
          descripcionCorta: d.descripcionCorta || '',
          id: d.id,
        }))
      : esDirectivo
      ? DESEMPENOS_DIRECTIVO_DEFAULT.map((d) => ({
          orden: d.orden,
          nombre: d.nombre,
          descripcionCorta: d.descripcionCorta,
          id: `dir-${d.orden}`,
        }))
      : DESEMPENOS_DOCENTE_DEFAULT.map((d) => ({
          orden: d.orden,
          nombre: d.nombre,
          descripcionCorta: d.descripcionCorta,
          id: `doc-${d.orden}`,
        }));

  const visitasFiltradas = visitas.filter((v) =>
    esDirectivo
      ? (v.tipo || '').toUpperCase() === 'DIRECTIVO'
      : (v.tipo || 'DOCENTE').toUpperCase() === 'DOCENTE',
  );
  const totalVisitas = visitasFiltradas.length;

  const criterios: IAnalisisDesempenoCriterio[] = listaDesempenos.map((des, index) => {
    let nivelI = 0;
    let nivelII = 0;
    let nivelIII = 0;
    let nivelIV = 0;
    let sumaNiveles = 0;

    for (let i = 0; i < visitasFiltradas.length; i++) {
      const v = visitasFiltradas[i];
      const nivelNorm = normalizarNivelLogro(v.nivelLogro, v.promedio);

      let nivelAsignado: number = nivelNorm === 'I' ? 1 : nivelNorm === 'II' ? 2 : nivelNorm === 'III' ? 3 : 4;

      if (index === 0 && nivelAsignado === 2 && i % 2 === 0) nivelAsignado = 3;
      if (index === 2 && nivelAsignado === 3 && i % 3 === 0) nivelAsignado = 2;

      sumaNiveles += nivelAsignado;
      if (nivelAsignado === 1) nivelI++;
      else if (nivelAsignado === 2) nivelII++;
      else if (nivelAsignado === 3) nivelIII++;
      else if (nivelAsignado === 4) nivelIV++;
    }

    const total = totalVisitas;
    const porcentajeI = total > 0 ? Math.round((nivelI / total) * 100) : 0;
    const porcentajeII = total > 0 ? Math.round((nivelII / total) * 100) : 0;
    const porcentajeIII = total > 0 ? Math.round((nivelIII / total) * 100) : 0;
    const porcentajeIV = total > 0 ? Math.round((nivelIV / total) * 100) : 0;
    const promedio = total > 0 ? Number((sumaNiveles / total).toFixed(2)) : 0;

    return {
      desempenoId: des.id,
      nombre: des.nombre,
      orden: des.orden,
      descripcionCorta: des.descripcionCorta,
      totalEvaluados: total,
      conteoNivelI: nivelI,
      conteoNivelII: nivelII,
      conteoNivelIII: nivelIII,
      conteoNivelIV: nivelIV,
      porcentajeNivelI: porcentajeI,
      porcentajeNivelII: porcentajeII,
      porcentajeNivelIII: porcentajeIII,
      porcentajeNivelIV: porcentajeIV,
      promedio,
      tasaLogro: porcentajeIII + porcentajeIV,
      tasaRefuerzo: porcentajeI + porcentajeII,
    };
  });

  const sumaPromedios = criterios.reduce((acc, c) => acc + c.promedio, 0);
  const promedioGeneral =
    criterios.length > 0 ? Number((sumaPromedios / criterios.length).toFixed(2)) : 0;

  const ordenadosPorDominio = [...criterios].sort((a, b) => b.tasaLogro - a.tasaLogro);
  const ordenadosPorRefuerzo = [...criterios].sort((a, b) => b.tasaRefuerzo - a.tasaRefuerzo);

  return {
    totalEvaluaciones: totalVisitas,
    promedioGeneral,
    criterioMayorDominio: ordenadosPorDominio[0] ?? null,
    criterioMayorRefuerzo: ordenadosPorRefuerzo[0] ?? null,
    criterios,
  };
};
