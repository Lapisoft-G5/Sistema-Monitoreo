/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="multer" />
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IFichaMonitoreo, NivelLogro } from '@sistema-monitoreo/shared-contracts';
import { FichaRepository } from '../repositories/ficha.repository.js';
import { STORAGE_SERVICE, type StorageService } from '../../../shared/storage/storage.constants.js';
import { BaremoCalculatorService } from '../motor/baremo-calculator.service.js';
import { ScopeFilter } from '../../../shared/auth/scope-filter.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { SessionUser } from '../../../shared/types/session-user.js';
import type {
  CreateFichaDto,
  SaveRespuestaDesempenoDto,
  SaveRespuestaEjeItemDto,
  FinalizarFichaDto,
} from '../dto/ficha.dto.js';

// RoleCode imported via SessionUser type for scope filter casts
@Injectable()
export class FichaService {
  constructor(
    private readonly repository: FichaRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly scopeFilter: ScopeFilter,
  ) {}

  async findByVisitaId(
    cronogramaId: string,
    session: SessionUser,
  ): Promise<IFichaMonitoreo | null> {
    return this.repository.findByVisitaId(cronogramaId);
  }

  async findById(id: string, session: SessionUser): Promise<IFichaMonitoreo> {
    const f = await this.repository.findById(id);
    if (!f) throw new NotFoundException(`Ficha ${id} no encontrada.`);

    // Validar scope: el usuario solo puede ver fichas dentro de su alcance.
    const scope = this.scopeFilter.forFicha({
      userId: session.id,
      role: session.role as RoleCode,
      institucionId: session.institucionId ?? null,
      especialistaNivel: session.especialistaNivel ?? null,
    });
    const allowed = await this.repository.existsWithScope(f.id, scope);
    if (!allowed) throw new ForbiddenException('No tiene acceso a esta ficha.');

    return f;
  }

  async crear(dto: CreateFichaDto, session: SessionUser): Promise<IFichaMonitoreo> {
    const cronograma = await this.repository.findCronogramaBasicById(dto.cronogramaId);
    if (!cronograma) throw new NotFoundException(`Visita ${dto.cronogramaId} no encontrada.`);

    const existente = await this.repository.findByVisitaId(dto.cronogramaId);
    if (existente) {
      throw new ConflictException(`Ya existe una ficha para esta visita (id=${existente.id}).`);
    }

    const plantilla = await this.repository.findPlantillaVigente(
      cronograma.tipoMonitoreo,
      cronograma.fechaProgramada.getFullYear(),
    );
    if (!plantilla) {
      throw new BadRequestException(
        `No existe plantilla Vigente para (${cronograma.tipoMonitoreo}, ${cronograma.fechaProgramada.getFullYear()}).`,
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
        const exists = await this.repository.findCursoBasicById(validCursoId);
        if (!exists) {
          validCursoId = undefined;
        }
      }

      if (!validCursoId) {
        const docenteCurso = await this.repository.findDocenteCursoByDocenteId(cronograma.evaluadoId);
        if (docenteCurso) {
          validCursoId = docenteCurso.cursoId;
        } else {
          const fallbackCurso = await this.repository.findFirstCursoBasic();
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

    const result = await this.repository.create({
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

    await this.repository.updateCronogramaEstado(dto.cronogramaId, 'EN_PROCESO');

    return result;
  }

  async guardarRespuesta(
    fichaId: string,
    dto: SaveRespuestaDesempenoDto,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
      );
    }
    await this.ensurePlantillaVigente(ficha);
    await this.repository.saveRespuestaDesempeno({
      fichaId,
      desempenoId: dto.desempenoId,
      nivel: dto.nivel,
      observaciones: dto.observaciones,
    });
    return this.repository.findById(fichaId) as Promise<IFichaMonitoreo>;
  }

  async guardarRespuestaAspecto(
    fichaId: string,
    aspectoId: string,
    marcado: boolean,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
      );
    }
    await this.ensurePlantillaVigente(ficha);
    await this.repository.saveRespuestaAspecto({ fichaId, aspectoId, marcado });
    return this.repository.findById(fichaId) as Promise<IFichaMonitoreo>;
  }

  /**
   * ILA-0046: si la plantilla de la ficha paso a Historico (porque se creo
   * una v2), rechaza el guardado con 409 + code PLANTILLA_VERSIONADA.
   * El frontend abre ModalMigracionPlantilla al recibir este codigo.
   */
  private async ensurePlantillaVigente(ficha: IFichaMonitoreo): Promise<void> {
    const plantilla = await this.repository.findPlantillaBasicById(ficha.plantillaId);
    if (plantilla && plantilla.estado === 'Vigente') return;

    const vigente = plantilla
      ? await this.repository.findPlantillaVigente(plantilla.tipoMonitoreo, plantilla.anioAcademico)
      : null;

    const conflict = new ConflictException({
      message:
        'La plantilla de esta ficha paso a Historico. Migre las respuestas a la version vigente.',
      code: 'PLANTILLA_VERSIONADA',
      plantillaVigenteId: vigente?.id ?? null,
      plantillaVigenteNombre: vigente?.descripcion ?? null,
    });
    throw conflict;
  }

  async finalizar(
    fichaId: string,
    dto: FinalizarFichaDto,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(`La ficha ya esta ${ficha.estado}.`);
    }

    if (ficha.respuestasDesempeno.length === 0) {
      throw new BadRequestException('No se puede finalizar una ficha sin respuestas de desempeno.');
    }

    const niveles = ficha.respuestasDesempeno.map((r) => r.nivel);
    const resultado = BaremoCalculatorService.calcularResultadoCompleto(niveles);

    const result = await this.repository.finalizar(
      fichaId,
      resultado.puntajeTotal,
      resultado.promedio,
      resultado.nivelLogro,
      session.id,
      dto.observaciones,
      dto.sugerencias,
      dto.compromisos,
    );

    await this.repository.updateCronogramaEstado(ficha.cronogramaId, 'COMPLETADO');

    return result;
  }

  async migrarPlantilla(
    fichaId: string,
    nuevaPlantillaId: string,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se pueden migrar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
      );
    }

    const plantillaNueva = await this.repository.findPlantillaBasicById(nuevaPlantillaId);
    if (!plantillaNueva) {
      throw new NotFoundException(`Plantilla ${nuevaPlantillaId} no encontrada.`);
    }

    return this.repository.migrarPlantilla(
      fichaId,
      nuevaPlantillaId,
      ficha.respuestasDesempeno.map((r) => ({ id: r.desempenoId, nivel: r.nivel })),
      ficha.respuestasAspecto.map((r) => ({ id: r.aspectoId, marcado: r.marcado })),
    );
  }

  async guardarRespuestaEjeItem(
    fichaId: string,
    dto: SaveRespuestaEjeItemDto,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
      );
    }
    await this.ensurePlantillaVigente(ficha);
    await this.repository.saveRespuestaEjeItem({
      fichaId,
      ejeItemId: dto.ejeItemId,
      nivel: dto.nivel,
      evidenciaUrl: dto.evidenciaUrl ?? null,
    });
    return this.repository.findById(fichaId) as Promise<IFichaMonitoreo>;
  }

  async subirEvidencia(
    fichaId: string,
    ejeItemId: string,
    file: Express.Multer.File,
    session: SessionUser,
  ): Promise<string> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`,
      );
    }
    await this.ensurePlantillaVigente(ficha);

    const saved = await this.storage.savePdf('evidencias', file.originalname, file.buffer);

    const existing = await this.repository.findRespuestaEjeItemByFichaAndEje(fichaId, ejeItemId);
    const nivel = existing ? existing.nivel : 1;
    await this.repository.saveRespuestaEjeItem({
      fichaId,
      ejeItemId,
      nivel,
      evidenciaUrl: saved.url,
    });
    return saved.url;
  }

  // ============== Motor de baremo (expuesto para tests y reuso) ==============
  static readonly baremo = BaremoCalculatorService;
}
