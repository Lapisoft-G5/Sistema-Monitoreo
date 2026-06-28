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
import {
  validarReglas,
  resolveAutor,
  guardVisibilidad,
  guardModificacion,
} from './plantilla-service.validator.js';

@Injectable()
export class PlantillaService {
  constructor(private readonly repository: PlantillaRepository) {}

  async findAll(filters?: QueryPlantillaDto, _session?: SessionUser): Promise<IPlantilla[]> {
    void _session;
    return this.repository.findAll(filters);
  }

  async findById(id: string, session?: SessionUser): Promise<IPlantilla> {
    const p = await this.repository.findById(id);
    if (!p) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    guardVisibilidad(p, session);
    return p;
  }

  async create(dto: CreatePlantillaDto, session: SessionUser): Promise<IPlantilla> {
    validarReglas(dto);
    const { rolAutorAlCrear, institucionId } = resolveAutor(session);
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
    guardModificacion(original, session);

    const fichasAsociadas = await this.repository.countFichasAsociadas(id);
    if (fichasAsociadas > 0) {
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
    guardModificacion(original, session);

    if (original.estado === 'Historico') {
      throw new BadRequestException(
        'Una plantilla Historico es terminal y no puede cambiar de estado.',
      );
    }
    if (original.estado === dto.estado) {
      return original;
    }

    if (dto.estado === 'Vigente') {
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
    guardModificacion(original, session);

    if (session.role !== RoleCode.JEFE_GESTION && session.role !== RoleCode.DIRECTOR_INSTITUCION) {
      throw new ForbiddenException(
        'Solo el Jefe de Gestion o el Director IE pueden eliminar plantillas.',
      );
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
      deletedEvidencias = await deleteEvidenciaFiles(evidenciaUrls);
    }

    return { id: result.id, deletedFichas: result.deletedFichas, deletedEvidencias };
  }

  async countFichas(
    id: string,
    session: SessionUser,
  ): Promise<{ count: number; estado: 'Borrador' | 'Vigente' | 'Historico' }> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);
    guardVisibilidad(original, session);
    const count = await this.repository.countFichasAsociadas(id);
    return { count, estado: original.estado };
  }

  async duplicar(
    id: string,
    session: SessionUser,
    descripcion?: string,
    anioAcademico?: number,
  ): Promise<IPlantilla> {
    const original = await this.repository.findById(id);
    if (!original) throw new NotFoundException(`Plantilla ${id} no encontrada.`);

    const { rolAutorAlCrear, institucionId } = resolveAutor(session);

    if (!institucionId && session.role === RoleCode.DIRECTOR_INSTITUCION) {
      throw new ForbiddenException('Director IE sin institucionId en sesion.');
    }

    if (session.role !== RoleCode.JEFE_GESTION && session.role !== RoleCode.DIRECTOR_INSTITUCION) {
      throw new ForbiddenException(
        'Solo Jefe de Gestion o Directores IE pueden duplicar plantillas.',
      );
    }
    return this.repository.clone(
      id,
      session.id,
      rolAutorAlCrear,
      institucionId,
      descripcion,
      anioAcademico,
    );
  }
}

export async function deleteEvidenciaFiles(urls: string[]): Promise<number> {
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
      // ignore
    }
  }
  return deleted;
}
