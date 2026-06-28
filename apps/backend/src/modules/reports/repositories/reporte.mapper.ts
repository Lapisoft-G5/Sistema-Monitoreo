import type {
  IReporteFicha,
  NivelLogro,
  TipoMonitoreo,
  EstadoFicha,
} from '@sistema-monitoreo/shared-contracts';

export function fromPrismaFichaReporte(f: any): IReporteFicha {
  return {
    id: f.id,
    cronogramaId: f.cronogramaId,
    institucionId: f.cronograma.institucion.id,
    institucionNombre: f.cronograma.institucion.nombre,
    institucionCodigoModular: f.cronograma.institucion.codigoModular,
    evaluadoId: f.cronograma.evaluadoId,
    evaluadoNombre: `${f.cronograma.evaluado.persona.nombres} ${f.cronograma.evaluado.persona.apellidos}`,
    especialistaId: f.cronograma.monitorId,
    especialistaNombre: `${f.cronograma.monitor.persona.nombres} ${f.cronograma.monitor.persona.apellidos}`,
    tipoMonitoreo: f.cronograma.tipoMonitoreo as TipoMonitoreo,
    anioAcademico: f.anioAcademico,
    nivelLogro: f.nivelLogro as NivelLogro,
    promedio: Number(f.promedio),
    puntajeTotal: f.puntajeTotal,
    estado: f.estado as EstadoFicha,
    fechaEjecucion: f.createdAt.toISOString(),
    modalidad: f.cronograma.modalidad,
    nivel: f.cronograma.nivelEducativo,
  };
}
