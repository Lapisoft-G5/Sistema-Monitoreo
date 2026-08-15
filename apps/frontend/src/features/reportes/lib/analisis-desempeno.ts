import type { BackendReportVisit } from '@/widgets/reportes';

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

export interface DesempenoPorNivelEducativo {
  nivelEducativo: string;
  total: number;
  nivelI: number;
  nivelII: number;
  nivelIII: number;
  nivelIV: number;
  promedio: number;
}

export interface DocenteEnRefuerzo {
  id: string;
  docenteNombre: string;
  institucion: string;
  especialista: string;
  fecha: string;
  nivelEducativo: string;
  nivelLogro: NivelLogroClave;
  promedio: number;
  puntajeTotal: number;
}

export interface AnalisisDesempenoResultado {
  totalEvaluaciones: number;
  totalDocentes: number;
  promedioGeneral: number;
  tasaSatisfactoria: number;
  tasaRefuerzo: number;
  distribucionNiveles: Record<NivelLogroClave, ConteoNivel>;
  distribucionArray: ConteoNivel[];
  porNivelEducativo: DesempenoPorNivelEducativo[];
  docentesRefuerzo: DocenteEnRefuerzo[];
  totalEnRefuerzo: number;
}

export const DETALLE_NIVELES: Record<
  NivelLogroClave,
  { nombre: string; descripcion: string; color: string; colorBg: string; colorBorder: string }
> = {
  I: {
    nombre: 'Nivel I',
    descripcion: 'En Inicio (Muy Deficiente)',
    color: '#ef4444',
    colorBg: 'bg-red-50',
    colorBorder: 'border-red-200 text-red-700',
  },
  II: {
    nombre: 'Nivel II',
    descripcion: 'En Proceso',
    color: '#f59e0b',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-200 text-amber-700',
  },
  III: {
    nombre: 'Nivel III',
    descripcion: 'Satisfactorio (Logro Esperado)',
    color: '#3b82f6',
    colorBg: 'bg-blue-50',
    colorBorder: 'border-blue-200 text-blue-700',
  },
  IV: {
    nombre: 'Nivel IV',
    descripcion: 'Destacado',
    color: '#10b981',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-200 text-emerald-700',
  },
};

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

export const calcularAnalisisDesempeno = (
  visitas: BackendReportVisit[],
): AnalisisDesempenoResultado => {
  const soloDocentes = visitas.filter((v) => (v.tipo || 'DOCENTE').toUpperCase() === 'DOCENTE');
  const totalEvaluaciones = soloDocentes.length;

  const conteos: Record<NivelLogroClave, number> = {
    I: 0,
    II: 0,
    III: 0,
    IV: 0,
  };

  let sumaPromedios = 0;
  const docentesVistos = new Set<string>();
  const docentesRefuerzo: DocenteEnRefuerzo[] = [];

  const nivelesEducativosMap = new Map<
    string,
    {
      total: number;
      nivelI: number;
      nivelII: number;
      nivelIII: number;
      nivelIV: number;
      sumaPromedio: number;
    }
  >();

  for (const v of soloDocentes) {
    const nivelNorm = normalizarNivelLogro(v.nivelLogro, v.promedio);
    conteos[nivelNorm] += 1;

    const prom = typeof v.promedio === 'number' && !Number.isNaN(v.promedio) ? v.promedio : 0;
    sumaPromedios += prom;

    const docenteId = v.evaluadoId || v.docenteDirectivo || v.id;
    docentesVistos.add(docenteId);

    // Agrupación por Nivel Educativo (Inicial, Primaria, Secundaria, etc.)
    const nivelEdu = v.nivel || 'Sin Nivel';
    if (!nivelesEducativosMap.has(nivelEdu)) {
      nivelesEducativosMap.set(nivelEdu, {
        total: 0,
        nivelI: 0,
        nivelII: 0,
        nivelIII: 0,
        nivelIV: 0,
        sumaPromedio: 0,
      });
    }
    const grupo = nivelesEducativosMap.get(nivelEdu)!;
    grupo.total += 1;
    grupo.sumaPromedio += prom;
    if (nivelNorm === 'I') grupo.nivelI += 1;
    if (nivelNorm === 'II') grupo.nivelII += 1;
    if (nivelNorm === 'III') grupo.nivelIII += 1;
    if (nivelNorm === 'IV') grupo.nivelIV += 1;

    // Docentes en Nivel I y II requieren fortalecimiento
    if (nivelNorm === 'I' || nivelNorm === 'II') {
      docentesRefuerzo.push({
        id: v.id,
        docenteNombre: v.docenteDirectivo || 'Docente no identificado',
        institucion: v.institucion || 'I.E. no especificada',
        especialista: v.especialista || 'No asignado',
        fecha: v.fechaHora,
        nivelEducativo: v.nivel || 'EBR',
        nivelLogro: nivelNorm,
        promedio: prom,
        puntajeTotal: v.puntajeTotal || 0,
      });
    }
  }

  // Ordenar docentes de refuerzo: menor puntaje/promedio primero (más urgente)
  docentesRefuerzo.sort((a, b) => a.promedio - b.promedio);

  const totalDocentes = docentesVistos.size;
  const promedioGeneral =
    totalEvaluaciones > 0 ? Number((sumaPromedios / totalEvaluaciones).toFixed(2)) : 0;

  const totalNivelAlto = conteos.III + conteos.IV;
  const totalNivelBajo = conteos.I + conteos.II;

  const tasaSatisfactoria =
    totalEvaluaciones > 0 ? Math.round((totalNivelAlto / totalEvaluaciones) * 100) : 0;
  const tasaRefuerzo =
    totalEvaluaciones > 0 ? Math.round((totalNivelBajo / totalEvaluaciones) * 100) : 0;

  const distribucionNiveles: Record<NivelLogroClave, ConteoNivel> = {
    I: {
      nivel: 'I',
      ...DETALLE_NIVELES.I,
      conteo: conteos.I,
      porcentaje: totalEvaluaciones > 0 ? Math.round((conteos.I / totalEvaluaciones) * 100) : 0,
    },
    II: {
      nivel: 'II',
      ...DETALLE_NIVELES.II,
      conteo: conteos.II,
      porcentaje: totalEvaluaciones > 0 ? Math.round((conteos.II / totalEvaluaciones) * 100) : 0,
    },
    III: {
      nivel: 'III',
      ...DETALLE_NIVELES.III,
      conteo: conteos.III,
      porcentaje: totalEvaluaciones > 0 ? Math.round((conteos.III / totalEvaluaciones) * 100) : 0,
    },
    IV: {
      nivel: 'IV',
      ...DETALLE_NIVELES.IV,
      conteo: conteos.IV,
      porcentaje: totalEvaluaciones > 0 ? Math.round((conteos.IV / totalEvaluaciones) * 100) : 0,
    },
  };

  const distribucionArray = [
    distribucionNiveles.I,
    distribucionNiveles.II,
    distribucionNiveles.III,
    distribucionNiveles.IV,
  ];

  const porNivelEducativo: DesempenoPorNivelEducativo[] = Array.from(
    nivelesEducativosMap.entries(),
  ).map(([nivelEducativo, g]) => ({
    nivelEducativo,
    total: g.total,
    nivelI: g.nivelI,
    nivelII: g.nivelII,
    nivelIII: g.nivelIII,
    nivelIV: g.nivelIV,
    promedio: g.total > 0 ? Number((g.sumaPromedio / g.total).toFixed(2)) : 0,
  }));

  return {
    totalEvaluaciones,
    totalDocentes,
    promedioGeneral,
    tasaSatisfactoria,
    tasaRefuerzo,
    distribucionNiveles,
    distribucionArray,
    porNivelEducativo,
    docentesRefuerzo,
    totalEnRefuerzo: docentesRefuerzo.length,
  };
};
