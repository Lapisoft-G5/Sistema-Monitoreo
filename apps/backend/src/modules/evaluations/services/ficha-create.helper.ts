import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import type { IFichaMonitoreo } from '@sistema-monitoreo/shared-contracts';
import type { FichaRepository } from '../repositories/ficha.repository.js';
import type { CreateFichaDto } from '../dto/ficha.dto.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

export async function crear(
  repository: FichaRepository,
  dto: CreateFichaDto,
  session: SessionUser,
): Promise<IFichaMonitoreo> {
  const cronograma = await repository.findCronogramaBasicById(dto.cronogramaId);
  if (!cronograma) throw new NotFoundException(`Visita ${dto.cronogramaId} no encontrada.`);

  const existente = await repository.findByVisitaId(dto.cronogramaId);
  if (existente) {
    throw new ConflictException(`Ya existe una ficha para esta visita (id=${existente.id}).`);
  }

  const anio = cronograma.fechaProgramada.getFullYear();

  // Si el frontend indica la plantilla que el actor está usando (su propia
  // plantilla), se honra tras validarla (Vigente y del mismo tipo/año) para que
  // las respuestas coincidan con la plantilla al renderizar/reportar. Si no se
  // indica o no es válida, se cae al comportamiento anterior (plantilla vigente).
  let plantilla = await (async () => {
    if (!dto.plantillaId) return null;
    const elegida = await repository.findPlantillaBasicById(dto.plantillaId);
    return elegida &&
      elegida.estado === 'Vigente' &&
      elegida.tipoMonitoreo === cronograma.tipoMonitoreo &&
      elegida.anioAcademico === anio
      ? elegida
      : null;
  })();
  if (!plantilla) {
    plantilla = await repository.findPlantillaVigente(cronograma.tipoMonitoreo, anio);
  }
  if (!plantilla) {
    throw new BadRequestException(
      `No existe plantilla Vigente para (${cronograma.tipoMonitoreo}, ${anio}).`,
    );
  }

  if (cronograma.tipoMonitoreo === 'DOCENTE') {
    const missing: string[] = [];
    if (!dto.areaCurricular) missing.push('areaCurricular');
    if (!dto.grado) missing.push('grado');
    if (!dto.seccion) missing.push('seccion');
    if (dto.cantidadEstudiantes === undefined) missing.push('cantidadEstudiantes');
    if (dto.cantidadEstudiantesNee === undefined) missing.push('cantidadEstudiantesNee');

    let validCursoId = dto.cursoId;
    if (validCursoId) {
      const exists = await repository.findCursoBasicById(validCursoId);
      if (!exists) {
        validCursoId = undefined;
      }
    }

    if (!validCursoId) {
      const docenteCurso = await repository.findDocenteCursoByDocenteId(cronograma.evaluadoId);
      if (docenteCurso) {
        validCursoId = docenteCurso.cursoId;
      } else {
        const fallbackCurso = await repository.findFirstCursoBasic();
        if (fallbackCurso) {
          validCursoId = fallbackCurso.id;
        }
      }
    }

    if (!validCursoId) missing.push('cursoId');
    else dto.cursoId = validCursoId;

    if (missing.length > 0) {
      throw new BadRequestException(
        `Contexto obligatorio para monitoreo DOCENTE. Faltan: ${missing.join(', ')}.`,
      );
    }
  } else if (cronograma.tipoMonitoreo === 'DIRECTIVO') {
    if (
      dto.areaCurricular ||
      dto.grado ||
      dto.seccion ||
      dto.cantidadEstudiantes !== undefined ||
      dto.cantidadEstudiantesNee !== undefined ||
      dto.cursoId
    ) {
      throw new BadRequestException(
        'Contexto debe ser NULL para monitoreo DIRECTIVO (no aplica area, grado, seccion, ni cantidad).',
      );
    }
  }

  const result = await repository.create({
    cronogramaId: dto.cronogramaId,
    plantillaId: plantilla.id,
    anioAcademico: cronograma.fechaProgramada.getFullYear(),
    contexto: {
      areaCurricular: dto.areaCurricular ?? null,
      grado: dto.grado ?? null,
      seccion: dto.seccion ?? null,
      cantidadEstudiantes: dto.cantidadEstudiantes ?? null,
      cantidadEstudiantesNee: dto.cantidadEstudiantesNee ?? null,
      cursoId: dto.cursoId ?? null,
    },
    creadoPorId: session.id,
  });

  await repository.updateCronogramaEstado(dto.cronogramaId, 'EN_PROCESO');

  return result;
}
