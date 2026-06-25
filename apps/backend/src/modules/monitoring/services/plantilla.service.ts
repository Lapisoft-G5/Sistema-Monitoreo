/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPlantilla, IUpdatePlantillaResponse } from '@sistema-monitoreo/shared-contracts';
import { PlantillaRepository } from '../repositories/plantilla.repository.js';
import type { CreatePlantillaDto } from '../dto/create-plantilla.dto.js';
import type { UpdatePlantillaDto, PatchEstadoPlantillaDto } from '../dto/update-plantilla.dto.js';
import type { QueryPlantillaDto } from '../dto/query-plantilla.dto.js';
import { RoleCode } from '../../../common/enums/role.enum.js';
import type { SessionUser } from '../../../shared/types/session-user.js';

@Injectable()
export class PlantillaService {
  constructor(private readonly repository: PlantillaRepository) {}

  async findAll(filters?: QueryPlantillaDto, session?: SessionUser): Promise<IPlantilla[]> {
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
      // Unicidad de plantilla Vigente por scope (UGEL o IE):
      //  - Plantilla UGEL (rolAutorAlCrear='jefe_gestion', institucionId=null):
      //    no debe haber otra UGEL Vigente del mismo tipo+anio.
      //  - Plantilla IE (rolAutorAlCrear='director_ie', institucionId=IE-X):
      //    no debe haber otra de la MISMA IE Vigente del mismo tipo+anio.
      //    Una plantilla UGEL Vigente puede coexistir con una IE Vigente
      //    del mismo tipo+anio, porque aplican a scopes distintos.
      const otrasVigentes = await this.repository.findAll({
        tipoMonitoreo: original.tipoMonitoreo,
        anioAcademico: original.anioAcademico,
        estado: 'Vigente',
        rolAutorAlCrear: original.rolAutorAlCrear,
        institucionId: original.institucionId,
      });
      const conflicto = otrasVigentes.find((p) => p.id !== id);
      if (conflicto) {
        throw new ConflictException(
          `Ya existe plantilla Vigente para (${original.tipoMonitoreo}, ${original.anioAcademico})` +
            (original.institucionId ? ` en su IE` : '') +
            `: ${conflicto.id}. Arch\u00edvela primero.`,
        );
      }
    }
    return this.repository.updateEstado(id, dto.estado);
  }

  async eliminar(
    id: string,
    session: SessionUser,
  ): Promise<{ id: string; deletedFichas: number; deletedEvidencias: number }> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    this.guardModificacion(original, session);

    if (session.role !== RoleCode.JEFE_GESTION && session.role !== RoleCode.DIRECTOR_INSTITUCION) {
      throw new ForbiddenException('Solo el Jefe de Gestion o el Director IE pueden eliminar plantillas.');
    }

    const fichas = await this.repository.findFichasByPlantilla(id);
    const fichasCount = fichas.length;

    if (original.estado !== 'Historico' && fichasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la plantilla en estado ${original.estado} porque tiene ${fichasCount} ficha(s) asociada(s). Archivela primero (cambie a Historico) o versione desde el editor.`,
      );
    }

    const evidenciaUrls: string[] = fichas.flatMap((f) => f.evidenciaUrls);

    const result = await this.repository.eliminarConCascade(id);

    let deletedEvidencias = 0;
    if (evidenciaUrls.length > 0) {
      deletedEvidencias = await this.deleteEvidenciaFiles(evidenciaUrls);
    }

    return {
      id: result.id,
      deletedFichas: result.deletedFichas,
      deletedEvidencias,
    };
  }

  private async deleteEvidenciaFiles(urls: string[]): Promise<number> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    let deleted = 0;
    for (const url of urls) {
      try {
        const filename = path.basename(new URL(url, 'http://x').pathname);
        const filepath = path.join(process.cwd(), 'uploads', filename);
        await fs.unlink(filepath);
        deleted += 1;
      } catch {
        // ignore: archivo no existe o no se pudo eliminar
      }
    }
    return deleted;
  }

  async countFichas(
    id: string,
    session: SessionUser,
  ): Promise<{ count: number; estado: 'Borrador' | 'Vigente' | 'Historico' }> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    this.guardVisibilidad(original, session);
    const count = await this.repository.countFichasAsociadas(id);
    return { count, estado: original.estado };
  }

  async duplicar(id: string, session: SessionUser, descripcion?: string): Promise<IPlantilla> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);

    let rolAutorAlCrear = 'jefe_gestion';
    let institucionId = null;

    if (this.isDirector(session)) {
      rolAutorAlCrear = 'director_ie';
      institucionId = session.institucionId ?? null;
      if (!institucionId) {
        throw new ForbiddenException('Director IE sin institucionId en sesion.');
      }
    } else if (session.role !== RoleCode.JEFE_GESTION) {
      throw new ForbiddenException(
        'Solo Jefe de Gestion o Directores IE pueden duplicar plantillas.',
      );
    }

    return this.repository.clone(
      id,
      session.id,
      rolAutorAlCrear as 'jefe_gestion' | 'director_ie',
      institucionId,
      descripcion,
    );
  }

  private validarReglas(dto: CreatePlantillaDto): void {
    const nivelesSet = new Set(dto.niveles.map((n) => n.nivelRomano));
    if (nivelesSet.size !== 4) {
      throw new BadRequestException(
        'La plantilla debe tener exactamente 4 niveles (I, II, III, IV).',
      );
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
    return session.role === RoleCode.DIRECTOR_INSTITUCION;
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
