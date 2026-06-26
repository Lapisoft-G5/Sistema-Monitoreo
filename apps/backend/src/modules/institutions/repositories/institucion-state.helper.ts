import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { Institucion } from '../entities/institucion.entity.js';
import { EstadoInstitucion } from '../../../common/enums/estado.enum.js';
import { mapInstitucion, INCLUDE_DOCENTE_DIRECTOR } from './institucion-mapper.helper.js';

export async function softDelete(
  prisma: PrismaService,
  id: string,
): Promise<Institucion> {
  const record = await prisma.institucionEducativa.update({
    where: { id },
    data: { estado: EstadoInstitucion.INACTIVA },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  return mapInstitucion(record);
}

export async function restore(
  prisma: PrismaService,
  id: string,
): Promise<Institucion> {
  const record = await prisma.institucionEducativa.update({
    where: { id },
    data: { estado: EstadoInstitucion.ACTIVA },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  return mapInstitucion(record);
}
