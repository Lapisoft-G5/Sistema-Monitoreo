import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { CargoCompatibilityService } from '../../../shared/auth/cargo-compatibility.service.js';
import { SessionRepository } from '../../auth/repositories/session.repository.js';
import { CargoNombre, resolvePrincipalCargo } from '../../../shared/auth/capability-map.js';

/**
 * Servicio de gestion de cargos del docente.
 *
 * Responsabilidades:
 *  - Listar cargos activos + historial.
 *  - Agregar un cargo respetando las reglas de coexistencia (via CargoCompatibilityService).
 *  - Finalizar un cargo (set fecha_fin) y recomputar el `es_principal` del docente.
 *
 * El `es_principal` se recalcula automaticamente en cada operacion de escritura
 * para mantener el invariant: max 1 cargo activo con es_principal = true.
 * El partial unique index `uq_docente_cargo_principal_activo` lo enforza en BD.
 */
@Injectable()
export class DocentesCargosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compatibility: CargoCompatibilityService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /**
   * Lista todos los cargos del docente (activos + finalizados) ordenados por
   * fecha_inicio desc. Incluye el nombre del cargo y `es_principal` calculado.
   */
  async list(docenteId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      include: {
        docenteCargos: {
          include: { cargo: true },
          orderBy: [{ fechaFin: 'asc' }, { fechaInicio: 'desc' }],
        },
      },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado.`);
    }
    return docente.docenteCargos.map((dc) => ({
      id: dc.id,
      cargoId: dc.cargoId,
      cargo: dc.cargo.nombre,
      fechaInicio: dc.fechaInicio,
      fechaFin: dc.fechaFin,
      esPrincipal: dc.esPrincipal,
    }));
  }

  /**
   * Agrega un cargo nuevo al docente. Valida coexistencia, recalcula
   * `es_principal` y devuelve el cargo creado.
   */
  async add(docenteId: string, cargoNombre: CargoNombre, fechaInicio?: Date) {
    // 1. Verificar que el docente existe.
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      include: {
        docenteCargos: {
          where: { fechaFin: null },
          include: { cargo: true },
        },
      },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado.`);
    }

    // 2. Validar coexistencia via CargoCompatibilityService.
    await this.compatibility.ensureCanAddCargo(docenteId, cargoNombre);

    // 3. Buscar el cargoId en la tabla cargos (por nombre).
    const cargoRow = await this.prisma.cargo.findFirst({
      where: { nombre: cargoNombre },
    });
    if (!cargoRow) {
      throw new NotFoundException(`Cargo "${cargoNombre}" no existe en el catalogo.`);
    }

    // 4. Recalcular es_principal: incluir el nuevo y resolver.
    const activos = docente.docenteCargos
      .filter((dc) => dc.cargo?.nombre)
      .map((dc) => dc.cargo.nombre as CargoNombre);
    const todos = [...activos, cargoNombre];
    const principalNombre = resolvePrincipalCargo(todos);

    // 5. Transaccion: crear el nuevo y ajustar es_principal de los activos.
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.docenteCargo.create({
        data: {
          id: randomUUID(),
          docenteId,
          cargoId: cargoRow.id,
          fechaInicio: fechaInicio ?? new Date(),
          fechaFin: null,
          esPrincipal: principalNombre === cargoNombre,
        },
      });
      // Si el nuevo no es el principal, el actual sigue siendolo.
      // Si el nuevo SI es el principal, demote al actual (si hay).
      if (principalNombre === cargoNombre) {
        await tx.docenteCargo.updateMany({
          where: {
            docenteId,
            fechaFin: null,
            NOT: { id: created.id },
          },
          data: { esPrincipal: false },
        });
      }
      return created;
    });
  }

  /**
   * Finaliza un cargo del docente (set fecha_fin). Recalcula `es_principal`
   * para que el siguiente cargo activo (si hay) tome el lugar, o ninguno
   * si era el unico.
   */
  async finalize(docenteId: string, docenteCargoId: string, fechaFin?: Date) {
    const dc = await this.prisma.docenteCargo.findUnique({
      where: { id: docenteCargoId },
      include: { cargo: true },
    });
    if (!dc || dc.docenteId !== docenteId) {
      throw new NotFoundException(
        `DocenteCargo ${docenteCargoId} no encontrado para el docente ${docenteId}.`,
      );
    }
    if (dc.fechaFin !== null) {
      throw new ConflictException(
        `El cargo "${dc.cargo.nombre}" ya fue finalizado el ${dc.fechaFin.toISOString()}.`,
      );
    }

    const fin = fechaFin ?? new Date();
    await this.prisma.$transaction(async (tx) => {
      // 1. Cerrar el cargo.
      await tx.docenteCargo.update({
        where: { id: docenteCargoId },
        data: { fechaFin: fin },
      });

      // 2. Si era principal, promover al siguiente activo de mayor prioridad.
      if (dc.esPrincipal) {
        const restantes = await tx.docenteCargo.findMany({
          where: { docenteId, fechaFin: null },
          include: { cargo: true },
        });
        const nombres = restantes
          .filter((r) => r.cargo?.nombre)
          .map((r) => r.cargo.nombre as CargoNombre);
        const nuevoPrincipal = resolvePrincipalCargo(nombres);
        if (nuevoPrincipal) {
          // Buscar el DocenteCargo del nombre resuelto y marcarlo.
          const target = restantes.find((r) => r.cargo?.nombre === nuevoPrincipal);
          if (target) {
            await tx.docenteCargo.update({
              where: { id: target.id },
              data: { esPrincipal: true },
            });
          }
        }
      }
    });

    // 3. Invalidar TODAS las sesiones activas del usuario asociado al docente.
    // Sus capabilities cambiaron (perdio un cargo, o el principal cambio); el
    // siguiente request con su access token devolvera 401 -> forzar re-login.
    const userId = await this.findUserIdByDocenteId(docenteId);
    if (userId) {
      await this.sessionRepository.invalidateAllUserSessions(userId, 'CARGO_FINALIZADO');
    }

    return { ok: true, cargoFinalizado: dc.cargo.nombre, fechaFin: fin };
  }

  private async findUserIdByDocenteId(docenteId: string): Promise<string | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      select: { persona: { select: { usuario: { select: { id: true } } } } },
    });
    return docente?.persona?.usuario?.id ?? null;
  }
}
