import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IFichaMonitoreo } from '@sistema-monitoreo/shared-contracts';
import type { FichaRepository } from '../repositories/ficha.repository.js';
import type { BaremoCalculatorService } from '../motor/baremo-calculator.service.js';
import type { FinalizarFichaDto } from '../dto/ficha.dto.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

export async function finalizar(
  repository: FichaRepository,
  baremoService: BaremoCalculatorService,
  fichaId: string,
  dto: FinalizarFichaDto,
  session: SessionUser,
): Promise<IFichaMonitoreo> {
  const ficha = await repository.findById(fichaId);
  if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
  if (ficha.estado !== 'BORRADOR') {
    throw new BadRequestException(`La ficha ya esta ${ficha.estado}.`);
  }

  if (ficha.respuestasDesempeno.length === 0) {
    throw new BadRequestException('No se puede finalizar una ficha sin respuestas de desempeno.');
  }

  const niveles = ficha.respuestasDesempeno.map((r) => r.nivel);
  const resultado = baremoService.calcularResultadoCompleto(niveles);

  const result = await repository.finalizar(
    fichaId,
    resultado.puntajeTotal,
    resultado.promedio,
    resultado.nivelLogro,
    session.id,
    dto.observaciones,
    dto.sugerencias,
    dto.compromisos,
  );

  await repository.updateCronogramaEstado(ficha.cronogramaId, 'COMPLETADO');

  return result;
}

export async function migrarPlantilla(
  repository: FichaRepository,
  fichaId: string,
  nuevaPlantillaId: string,
  session: SessionUser,
): Promise<IFichaMonitoreo> {
  const ficha = await repository.findById(fichaId);
  if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
  if (ficha.estado !== 'BORRADOR') {
    throw new BadRequestException(
      `Solo se pueden migrar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
    );
  }

  const plantillaNueva = await repository.findPlantillaBasicById(nuevaPlantillaId);
  if (!plantillaNueva) {
    throw new NotFoundException(`Plantilla ${nuevaPlantillaId} no encontrada.`);
  }

  return repository.migrarPlantilla(
    fichaId,
    nuevaPlantillaId,
    ficha.respuestasDesempeno.map((r) => ({ id: r.desempenoId, nivel: r.nivel })),
    ficha.respuestasAspecto.map((r) => ({ id: r.aspectoId, marcado: r.marcado })),
  );
}
