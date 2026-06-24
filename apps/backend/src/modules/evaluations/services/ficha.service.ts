/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="multer" />
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IFichaMonitoreo, NivelLogro } from '@sistema-monitoreo/shared-contracts';
import { FichaRepository } from '../repositories/ficha.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { BaremoCalculatorService } from '../motor/baremo-calculator.service.js';
import { ScopeFilter } from '../../../shared/auth/scope-filter.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type {
  CreateFichaDto,
  SaveRespuestaDesempenoDto,
  SaveRespuestaEjeItemDto,
  FinalizarFichaDto,
} from '../dto/ficha.dto.js';

export interface SessionUser {
  id: string;
  role: string;
  institucionId?: string | null;
  especialistaNivel?: string | null;
}

@Injectable()
export class FichaService {
  constructor(
    private readonly repository: FichaRepository,
    private readonly prisma: PrismaService,
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
    const allowed = await this.prisma.fichaMonitoreo.findFirst({
      where: { id: f.id, ...scope },
      select: { id: true },
    });
    if (!allowed) throw new ForbiddenException('No tiene acceso a esta ficha.');

    return f;
  }

  async crear(dto: CreateFichaDto, session: SessionUser): Promise<IFichaMonitoreo> {
    const cronograma = await this.prisma.cronograma.findUnique({
      where: { id: dto.cronogramaId },
    });
    if (!cronograma) throw new NotFoundException(`Visita ${dto.cronogramaId} no encontrada.`);

    const existente = await this.repository.findByVisitaId(dto.cronogramaId);
    if (existente) {
      throw new ConflictException(`Ya existe una ficha para esta visita (id=${existente.id}).`);
    }

    // Resolver plantilla vigente del tipo
    const plantilla = await this.prisma.plantillaMonitoreo.findFirst({
      where: {
        tipoMonitoreo: cronograma.tipoMonitoreo,
        anioAcademico: cronograma.fechaProgramada.getFullYear(),
        estado: 'Vigente',
        deleted: false,
      },
    });
    if (!plantilla) {
      throw new BadRequestException(
        `No existe plantilla Vigente para (${cronograma.tipoMonitoreo}, ${cronograma.fechaProgramada.getFullYear()}).`,
      );
    }

    // Validar contexto obligatorio para DOCENTE, NULL para DIRECTIVO
    if (cronograma.tipoMonitoreo === 'DOCENTE') {
      const missing: string[] = [];
      if (!dto.areaCurricular) missing.push('areaCurricular');
      if (!dto.grado) missing.push('grado');
      if (!dto.seccion) missing.push('seccion');
      if (dto.cantidadEstudiantes === undefined) missing.push('cantidadEstudiantes');
      if (dto.cantidadEstudiantesNee === undefined) missing.push('cantidadEstudiantesNee');

      let validCursoId = dto.cursoId;
      if (validCursoId) {
        const exists = await this.prisma.curso.findUnique({ where: { id: validCursoId } });
        if (!exists) {
          validCursoId = undefined;
        }
      }

      if (!validCursoId) {
        // Buscar un curso asociado a este docente
        const docenteCurso = await this.prisma.docenteCurso.findFirst({
          where: { docenteId: cronograma.evaluadoId },
        });
        if (docenteCurso) {
          validCursoId = docenteCurso.cursoId;
        } else {
          // Fallback al primer curso del sistema
          const fallbackCurso = await this.prisma.curso.findFirst();
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
      // DIRECTIVO: todo el contexto debe ser NULL
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

    await this.prisma.cronograma.update({
      where: { id: dto.cronogramaId },
      data: { estado: 'EN_PROCESO' },
    });

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
    const plantilla = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: ficha.plantillaId },
    });
    if (plantilla && plantilla.estado === 'Vigente') return;

    const vigente = await this.prisma.plantillaMonitoreo.findFirst({
      where: {
        tipoMonitoreo: plantilla?.tipoMonitoreo,
        anioAcademico: plantilla?.anioAcademico,
        estado: 'Vigente',
        deleted: false,
      },
    });

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

    await this.prisma.cronograma.update({
      where: { id: ficha.cronogramaId },
      data: { estado: 'COMPLETADO' },
    });

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

    // Verificar que la plantilla nueva existe y es del mismo tipo
    const plantillaNueva = await this.prisma.plantillaMonitoreo.findUnique({
      where: { id: nuevaPlantillaId },
    });
    if (!plantillaNueva) {
      throw new NotFoundException(`Plantilla ${nuevaPlantillaId} no encontrada.`);
    }

    // Mapear desempenoId v1 -> desempenoId v2 por nombre
    const desempenosV2 = await this.prisma.desempenoPlantilla.findMany({
      where: { plantillaId: nuevaPlantillaId },
      include: { aspectos: true },
    });
    const desempenoPorNombre = new Map<string, (typeof desempenosV2)[number]>();
    for (const d of desempenosV2) {
      desempenoPorNombre.set(d.nombre, d);
    }

    // Mutar respuestas a la nueva plantilla
    await this.prisma.$transaction(async (tx) => {
      // Eliminar respuestas del desempeno viejo
      await tx.fichaRespuestaDesempeno.deleteMany({ where: { fichaId } });
      await tx.fichaRespuestaAspecto.deleteMany({ where: { fichaId } });
      // Re-crear respuestas para desempenos de la nueva plantilla
      for (const r of ficha.respuestasDesempeno) {
        // Buscar desempeno equivalente en v2 por nombre
        const desempenoV1 = await tx.desempenoPlantilla.findUnique({
          where: { id: r.desempenoId },
        });
        const desempenoV2 = desempenoV1 ? desempenoPorNombre.get(desempenoV1.nombre) : null;
        if (desempenoV2) {
          await tx.fichaRespuestaDesempeno.create({
            data: { fichaId, desempenoId: desempenoV2.id, nivel: r.nivel },
          });
        }
        // Si no hay equivalente, la respuesta se pierde (silenciosamente)
      }
      for (const r of ficha.respuestasAspecto) {
        const aspectoV1 = await tx.aspectoEvaluado.findUnique({
          where: { id: r.aspectoId },
          include: { desempeno: true },
        });
        if (!aspectoV1) continue;
        const desempenoV2 = desempenoPorNombre.get(aspectoV1.desempeno.nombre);
        const aspectoV2 = desempenoV2?.aspectos.find(
          (a) => a.descripcion === aspectoV1.descripcion,
        );
        if (aspectoV2) {
          await tx.fichaRespuestaAspecto.create({
            data: { fichaId, aspectoId: aspectoV2.id, marcado: r.marcado },
          });
        }
      }
      // Actualizar la ficha con la nueva plantillaId
      await tx.fichaMonitoreo.update({
        where: { id: fichaId },
        data: { plantillaId: nuevaPlantillaId },
      });
    });

    return this.repository.findById(fichaId) as Promise<IFichaMonitoreo>;
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

    const fs = await import('node:fs');
    const path = await import('node:path');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.bin';
    const filename = `${fichaId}_${ejeItemId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const url = `/uploads/${filename}`;
    const existing = await this.prisma.fichaRespuestaEjeItem.findFirst({
      where: { fichaId, ejeItemId },
    });
    const nivel = existing ? existing.nivel : 1;
    await this.repository.saveRespuestaEjeItem({
      fichaId,
      ejeItemId,
      nivel,
      evidenciaUrl: url,
    });
    return url;
  }

  // ============== Motor de baremo (expuesto para tests y reuso) ==============
  static readonly baremo = BaremoCalculatorService;
}
