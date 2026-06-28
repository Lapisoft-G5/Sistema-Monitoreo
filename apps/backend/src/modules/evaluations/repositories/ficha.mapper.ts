import type {
  IFichaMonitoreo,
  IFichaContexto,
  IFichaRespuestaDesempeno,
  IFichaRespuestaAspecto,
  IFichaRespuestaEjeItem,
} from '@sistema-monitoreo/shared-contracts';

export function mapContexto(c: any): IFichaContexto {
  return {
    id: c.id,
    areaCurricular: c.areaCurricular,
    grado: c.grado,
    seccion: c.seccion,
    cantidadEstudiantes: c.cantidadEstudiantes,
    cantidadEstudiantesNee: c.cantidadEstudiantesNee,
    cursoId: c.cursoId,
  };
}

export function fromPrismaFicha(ficha: any): IFichaMonitoreo {
  const requiereMigracion = ficha.plantilla?.estado === 'Historico';

  return {
    id: ficha.id,
    cronogramaId: ficha.cronogramaId,
    plantillaId: ficha.plantillaId,
    plantillaVersion: ficha.plantilla?.version ?? 0,
    fichaContextoId: ficha.fichaContextoId,
    anioAcademico: ficha.anioAcademico,
    puntajeTotal: ficha.puntajeTotal,
    promedio: Number(ficha.promedio),
    nivelLogro: ficha.nivelLogro,
    estado: ficha.estado,
    contexto: mapContexto(ficha.fichaContexto),
    respuestasDesempeno: (ficha.respuestasDesempeno || []).map(fromPrismaRespuestaDesempeno),
    respuestasAspecto: (ficha.respuestasAspecto || []).map(fromPrismaRespuestaAspecto),
    respuestasEjeItem: (ficha.respuestasEjeItem || []).map(fromPrismaRespuestaEjeItem),
    creadoPorId: ficha.creadoPorId,
    finalizadaPorId: ficha.finalizadaPorId,
    observaciones: ficha.observaciones,
    sugerencias: ficha.sugerencias || null,
    compromisos: ficha.compromisos || null,
    requiereMigracion,
    plantillaHistoricaId: requiereMigracion ? ficha.plantillaId : null,
    createdAt: ficha.createdAt.toISOString(),
    finalizadaAt: ficha.finalizadaAt ? ficha.finalizadaAt.toISOString() : null,
  };
}

function fromPrismaRespuestaDesempeno(r: any): IFichaRespuestaDesempeno {
  return {
    id: r.id,
    fichaId: r.fichaId,
    desempenoId: r.desempenoId,
    nivel: r.nivel,
    observaciones: r.observaciones,
  };
}

function fromPrismaRespuestaAspecto(r: any): IFichaRespuestaAspecto {
  return {
    id: r.id,
    fichaId: r.fichaId,
    aspectoId: r.aspectoId,
    marcado: r.marcado,
  };
}

function fromPrismaRespuestaEjeItem(r: any): IFichaRespuestaEjeItem {
  return {
    id: r.id,
    fichaId: r.fichaId,
    ejeItemId: r.ejeItemId,
    nivel: r.nivel,
    evidenciaUrl: r.evidenciaUrl,
  };
}
