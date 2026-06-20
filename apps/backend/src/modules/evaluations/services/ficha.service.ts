import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IFichaMonitoreo,
  NivelLogro,
} from '@sistema-monitoreo/shared-contracts';
import { FichaRepository } from '../repositories/ficha.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { BaremoCalculatorService } from '../motor/baremo-calculator.service.js';
import type { CreateFichaDto, SaveRespuestaDesempenoDto, FinalizarFichaDto } from '../dto/ficha.dto.js';

export interface SessionUser {
  id: string;
  role: string;
  institucionId?: string | null;
}

@Injectable()
export class FichaService {
  constructor(
    private readonly repository: FichaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByVisitaId(cronogramaId: string, session: SessionUser): Promise<IFichaMonitoreo | null> {
    return this.repository.findByVisitaId(cronogramaId);
  }

  async findById(id: string, session: SessionUser): Promise<IFichaMonitoreo> {
    const f = await this.repository.findById(id);
    if (!f) throw new NotFoundException(`Ficha ${id} no encontrada.`);
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
      if (!dto.cursoId) missing.push('cursoId');
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

    return this.repository.create({
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
  }

  async guardarRespuesta(
    fichaId: string,
    dto: SaveRespuestaDesempenoDto,
    session: SessionUser,
  ): Promise<IFichaMonitoreo> {
    const ficha = await this.repository.findById(fichaId);
    if (!ficha) throw new NotFoundException(`Ficha ${fichaId} no encontrada.`);
    if (ficha.estado !== 'BORRADOR') {
      throw new BadRequestException(`Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`);
    }
    await this.repository.saveRespuestaDesempeno({
      fichaId,
      desempenoId: dto.desempenoId,
      nivel: dto.nivel,
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
      throw new BadRequestException(`Solo se pueden modificar fichas en BORRADOR. Estado actual: ${ficha.estado}.`);
    }
    await this.repository.saveRespuestaAspecto({ fichaId, aspectoId, marcado });
    return this.repository.findById(fichaId) as Promise<IFichaMonitoreo>;
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

    return this.repository.finalizar(
      fichaId,
      resultado.puntajeTotal,
      resultado.promedio,
      resultado.nivelLogro,
      session.id,
      dto.observaciones,
    );
  }

  // ============== Motor de baremo (expuesto para tests y reuso) ==============
  static readonly baremo = BaremoCalculatorService;
}
