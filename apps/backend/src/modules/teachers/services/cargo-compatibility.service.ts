import { ConflictException, Injectable } from '@nestjs/common';
import {
  canAddCargo as canAddCargoRule,
  CargoNombre,
} from '../../../shared/auth/capability-map.js';
import { DocentesCargosRepository } from '../repositories/docentes-cargos.repository.js';

/**
 * Servicio que valida las reglas de coexistencia de cargos docentes antes
 * de insertar/actualizar un DocenteCargo.
 *
 * Las reglas de fondo viven en `capability-map.ts` (function `canAddCargo`).
 * Este service las conecta a la BD a traves del repositorio: trae los cargos
 * activos del docente y delega la decision a la regla.
 */
@Injectable()
export class CargoCompatibilityService {
  constructor(private readonly docentesCargosRepository: DocentesCargosRepository) {}

  /**
   * Valida que el docente pueda recibir el nuevo cargo respetando las reglas
   * de coexistencia. Lanza ConflictException con mensaje claro si viola.
   */
  async ensureCanAddCargo(docenteId: string, nuevoCargo: CargoNombre): Promise<void> {
    const active = await this.docentesCargosRepository.findActiveCargoNombresByDocenteId(docenteId);
    if (!canAddCargoRule(active, nuevoCargo)) {
      throw new ConflictException(
        `No se puede agregar el cargo "${nuevoCargo}" al docente. Reglas de coexistencia violadas. ` +
          `Cargos activos: [${active.join(', ') || 'ninguno'}].`,
      );
    }
  }
}
