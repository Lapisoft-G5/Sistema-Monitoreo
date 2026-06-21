import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { canAddCargo as canAddCargoRule, CargoNombre } from './capability-map.js';

/**
 * Servicio que valida las reglas de coexistencia de cargos docentes antes
 * de insertar/actualizar un DocenteCargo.
 *
 * Las reglas de fondo viven en `capability-map.ts` (function `canAddCargo`).
 * Este service las conecta a la BD: trae los cargos activos del docente
 * y delega la decisión a la regla.
 *
 * Ademas, gestiona el campo `es_principal` automaticamente: cuando se agrega
 * un cargo nuevo con mayor prioridad que el actual, el anterior deja de ser
 * principal y el nuevo pasa a serlo.
 */
@Injectable()
export class CargoCompatibilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve los cargos activos del docente (fecha_fin IS NULL).
   */
  async getActiveDocenteCargos(docenteId: string): Promise<CargoNombre[]> {
    const records = await this.prisma.docenteCargo.findMany({
      where: { docenteId, fechaFin: null },
      include: { cargo: true },
    });
    return records.filter((dc) => dc.cargo?.nombre).map((dc) => dc.cargo.nombre as CargoNombre);
  }

  /**
   * Valida que el docente pueda recibir el nuevo cargo respetando las reglas
   * de coexistencia. Lanza ConflictException con mensaje claro si viola.
   */
  async ensureCanAddCargo(docenteId: string, nuevoCargo: CargoNombre): Promise<void> {
    const active = await this.getActiveDocenteCargos(docenteId);
    if (!canAddCargoRule(active, nuevoCargo)) {
      throw new ConflictException(
        `No se puede agregar el cargo "${nuevoCargo}" al docente. Reglas de coexistencia violadas. ` +
          `Cargos activos: [${active.join(', ') || 'ninguno'}].`,
      );
    }
  }
}
