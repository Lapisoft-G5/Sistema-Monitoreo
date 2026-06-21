import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { SessionRepository } from '../../auth/repositories/session.repository.js';
import { EspecialistaCargoEnum } from '../../../shared/auth/capability-map.js';

/**
 * Servicio de gestion de cargos del Especialista.
 *
 * A diferencia del docente, el Especialista solo puede tener UN cargo activo
 * a la vez (constraint: uq_especialista_cargo_activo). Esto se enforza por
 * el partial unique index en la migración. La validacion service-side es
 * defense-in-depth: lanza ConflictException si ya hay un cargo activo antes
 * de intentar el INSERT.
 *
 * Ademas, mantiene el campo espejo `Especialista.cargo` sincronizado con
 * el EspecialistaCargo activo que tiene `es_principal = true` (la app
 * garantiza que es el unico activo).
 */
@Injectable()
export class EspecialistasCargosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async list(especialistaId: string) {
    const especialista = await this.prisma.especialista.findUnique({
      where: { id: especialistaId },
      include: {
        cargos: {
          orderBy: [{ fechaFin: 'asc' }, { fechaInicio: 'desc' }],
        },
      },
    });
    if (!especialista) {
      throw new NotFoundException(`Especialista ${especialistaId} no encontrado.`);
    }
    return especialista.cargos.map((ec) => ({
      id: ec.id,
      cargo: ec.cargo,
      fechaInicio: ec.fechaInicio,
      fechaFin: ec.fechaFin,
      esPrincipal: ec.esPrincipal,
    }));
  }

  /**
   * Agrega un cargo al Especialista. Constraint: max 1 activo.
   * Tambien sincroniza `Especialista.cargo` con el nuevo valor.
   */
  async add(especialistaId: string, cargo: EspecialistaCargoEnum, fechaInicio?: Date) {
    const especialista = await this.prisma.especialista.findUnique({
      where: { id: especialistaId },
      include: {
        cargos: { where: { fechaFin: null } },
      },
    });
    if (!especialista) {
      throw new NotFoundException(`Especialista ${especialistaId} no encontrado.`);
    }
    if (especialista.cargos.length > 0) {
      throw new ConflictException(
        `El Especialista ya tiene un cargo activo: "${especialista.cargos[0].cargo}". ` +
          `Finalicelo primero antes de agregar uno nuevo.`,
      );
    }

    const inicio = fechaInicio ?? new Date();

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.especialistaCargo.create({
        data: {
          id: randomUUID(),
          especialistaId,
          cargo,
          fechaInicio: inicio,
          fechaFin: null,
          esPrincipal: true,
        },
      });
      // Sincronizar el campo espejo `Especialista.cargo`.
      await tx.especialista.update({
        where: { id: especialistaId },
        data: { cargo },
      });
      return created;
    });
  }

  /**
   * Finaliza un cargo del Especialista. Constraint: no se puede finalizar
   * un cargo ya cerrado. Si era el unico activo, limpia `Especialista.cargo`
   * con el valor del cargo recien finalizado (para que el campo no quede
   * apuntando a algo que ya no esta activo — un admin lo actualizara).
   */
  async finalize(especialistaId: string, especialistaCargoId: string, fechaFin?: Date) {
    const ec = await this.prisma.especialistaCargo.findUnique({
      where: { id: especialistaCargoId },
    });
    if (!ec || ec.especialistaId !== especialistaId) {
      throw new NotFoundException(
        `EspecialistaCargo ${especialistaCargoId} no encontrado para el especialista ${especialistaId}.`,
      );
    }
    if (ec.fechaFin !== null) {
      throw new ConflictException(
        `El cargo "${ec.cargo}" ya fue finalizado el ${ec.fechaFin.toISOString()}.`,
      );
    }

    const fin = fechaFin ?? new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.especialistaCargo.update({
        where: { id: especialistaCargoId },
        data: { fechaFin: fin },
      });
      // Sincronizar el campo espejo: queda con el cargo recien finalizado.
      // Un admin debera agregar el siguiente cargo via POST.
      await tx.especialista.update({
        where: { id: especialistaId },
        data: { cargo: ec.cargo },
      });
    });

    // Invalidar sesiones del usuario: sus capabilities cambiaron.
    const userId = await this.findUserIdByEspecialistaId(especialistaId);
    if (userId) {
      await this.sessionRepository.invalidateAllUserSessions(userId, 'CARGO_FINALIZADO');
    }

    return { ok: true, cargoFinalizado: ec.cargo, fechaFin: fin };
  }

  private async findUserIdByEspecialistaId(especialistaId: string): Promise<string | null> {
    const esp = await this.prisma.especialista.findUnique({
      where: { id: especialistaId },
      select: { persona: { select: { usuario: { select: { id: true } } } } },
    });
    return esp?.persona?.usuario?.id ?? null;
  }
}
