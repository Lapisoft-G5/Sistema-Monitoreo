import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IPlantilla,
  IUpdatePlantillaResponse,
} from '@sistema-monitoreo/shared-contracts';
import { PlantillaRepository } from '../repositories/plantilla.repository.js';
import type { CreatePlantillaDto } from '../dto/create-plantilla.dto.js';
import type { UpdatePlantillaDto, PatchEstadoPlantillaDto } from '../dto/update-plantilla.dto.js';
import type { QueryPlantillaDto } from '../dto/query-plantilla.dto.js';

export interface SessionUser {
  id: string;
  role: string;
  institucionId?: string | null;
}

@Injectable()
export class PlantillaService {
  constructor(private readonly repository: PlantillaRepository) {}

  async findAll(
    filters?: QueryPlantillaDto,
    session?: SessionUser,
  ): Promise<IPlantilla[]> {
    return this.repository.findAll(filters);
  }

  async findById(id: string, session?: SessionUser): Promise<IPlantilla> {
    const p = await this.repository.findById(id);
    if (!p) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    this.guardVisibilidad(p, session);
    return p;
  }

  async create(dto: CreatePlantillaDto, session: SessionUser): Promise<IPlantilla> {
    this.validarReglas(dto);
    const { rolAutorAlCrear, institucionId } = this.resolveAutor(session);
    return this.repository.create({
      data: dto,
      autorId: session.id,
      rolAutorAlCrear,
      institucionId,
    });
  }

  async update(
    id: string,
    dto: UpdatePlantillaDto,
    session: SessionUser,
  ): Promise<IUpdatePlantillaResponse> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    this.guardModificacion(original, session);

    const fichasAsociadas = await this.repository.countFichasAsociadas(id);
    if (fichasAsociadas > 0) {
      // ILA-0046: clonar a v+1, no sobrescribir
      const clon = await this.repository.versionarConClon(id, { data: dto }, session.id);
      return {
        id: clon.id,
        version: clon.version,
        modo: 'VERSIONADO',
        mensaje: `La plantilla tenia ${fichasAsociadas} ficha(s) asociada(s). Se creo la version v${clon.version}; la anterior quedo como Historico.`,
        plantilla: clon,
      };
    }

    const actualizada = await this.repository.updateInPlace(id, { data: dto });
    return {
      id: actualizada.id,
      version: actualizada.version,
      modo: 'IN_PLACE',
      mensaje: 'Cambios guardados in-place (sin fichas asociadas).',
      plantilla: actualizada,
    };
  }

  async cambiarEstado(
    id: string,
    dto: PatchEstadoPlantillaDto,
    session: SessionUser,
  ): Promise<IPlantilla> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    this.guardModificacion(original, session);

    if (original.estado === 'Historico') {
      throw new BadRequestException(
        'Una plantilla Historico es terminal y no puede cambiar de estado.',
      );
    }
    if (original.estado === dto.estado) {
      return original;
    }

    if (dto.estado === 'Vigente') {
      // No debe haber otra plantilla vigente del mismo tipo+anio
      const otrasVigentes = await this.repository.findAll({
        tipoMonitoreo: original.tipoMonitoreo,
        anioAcademico: original.anioAcademico,
        estado: 'Vigente',
      });
      const conflicto = otrasVigentes.find((p) => p.id !== id);
      if (conflicto) {
        throw new ConflictException(
          `Ya existe plantilla Vigente para (${original.tipoMonitoreo}, ${original.anioAcademico}): ${conflicto.id}. Archivela primero.`,
        );
      }
    }
    return this.repository.updateEstado(id, dto.estado);
  }

  async duplicar(
    id: string,
    session: SessionUser,
    descripcion?: string,
  ): Promise<IPlantilla> {
    if (!this.isDirector(session)) {
      throw new ForbiddenException('Solo Directores IE pueden duplicar plantillas.');
    }
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    const institucionId = session.institucionId ?? null;
    if (!institucionId) {
      throw new ForbiddenException('Director IE sin institucionId en sesion.');
    }
    return this.repository.clone(id, session.id, 'director_ie', institucionId, descripcion);
  }

  private validarReglas(dto: CreatePlantillaDto): void {
    const nivelesSet = new Set(dto.niveles.map((n) => n.nivelRomano));
    if (nivelesSet.size !== 4) {
      throw new BadRequestException('La plantilla debe tener exactamente 4 niveles (I, II, III, IV).');
    }
    for (const d of dto.desempenos) {
      const rubricaSet = new Set(d.rubrica.map((r) => r.nivelRomano));
      if (rubricaSet.size !== 4) {
        throw new BadRequestException(
          `El desempeno "${d.nombre}" debe tener rubrica para los 4 niveles (I, II, III, IV).`,
        );
      }
    }
  }

  private isDirector(session: SessionUser): boolean {
    return session.role === 'director_institucion' || session.role === 'director_ie';
  }

  private resolveAutor(session: SessionUser): {
    rolAutorAlCrear: 'jefe_gestion' | 'director_ie';
    institucionId: string | null;
  } {
    if (this.isDirector(session)) {
      return {
        rolAutorAlCrear: 'director_ie',
        institucionId: session.institucionId ?? null,
      };
    }
    return { rolAutorAlCrear: 'jefe_gestion', institucionId: null };
  }

  private guardVisibilidad(plantilla: IPlantilla, session?: SessionUser): void {
    if (!session) return;
    if (this.isDirector(session) && plantilla.rolAutorAlCrear === 'jefe_gestion') {
      // Director IE puede VER plantillas UGEL (en solo lectura), pero no editarlas
      return;
    }
  }

  private guardModificacion(plantilla: IPlantilla, session: SessionUser): void {
    if (this.isDirector(session) && plantilla.rolAutorAlCrear === 'jefe_gestion') {
      throw new ForbiddenException('Los Directores IE no pueden modificar plantillas UGEL.');
    }
  }
}
