import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { CreateInstitucionDto } from '../dto/create-institucion.dto.js';
import { UpdateInstitucionDto } from '../dto/update-institucion.dto.js';
import { Institucion } from '../entities/institucion.entity.js';
import { EstadoInstitucion } from '../../../common/enums/estado.enum.js';
import { mapInstitucion, INCLUDE_DOCENTE_DIRECTOR } from './institucion-mapper.helper.js';
import { assignDirector } from './institucion-director.helper.js';

export async function create(
  prisma: PrismaService,
  data: CreateInstitucionDto,
): Promise<Institucion> {
  const { directorDni, ...createData } = data;

  const payload: Prisma.InstitucionEducativaUncheckedCreateInput = {
    codigoModular: createData.codigoModular,
    codigoLocal: createData.codigoLocal,
    nombre: createData.nombre,
    nivelEducativo: createData.nivelEducativo,
    nivelEducativoId:
      ((createData as Record<string, unknown>).nivelEducativoId as string | undefined) ?? null,
    departamento: createData.departamento ?? 'Puno',
    provincia: createData.provincia,
    distrito: createData.distrito,
    direccion: createData.direccion,
    zona: createData.zona,
    estado: createData.estado ?? EstadoInstitucion.ACTIVA,
    modalidad: createData.modalidad as string,
  };

  const record = await prisma.institucionEducativa.create({
    data: payload,
    include: INCLUDE_DOCENTE_DIRECTOR,
  });

  if (directorDni) {
    await assignDirector(prisma, record.id, directorDni);
  }

  const reloaded = await prisma.institucionEducativa.findUnique({
    where: { id: record.id },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });

  return mapInstitucion(reloaded || record);
}

export async function update(
  prisma: PrismaService,
  id: string,
  data: UpdateInstitucionDto,
): Promise<Institucion> {
  const { directorDni, ...updateData } = data;

  if (directorDni !== undefined) {
    await assignDirector(prisma, id, directorDni);
  }

  const updatePayload: Prisma.InstitucionEducativaUncheckedUpdateInput = {
    ...updateData,
    nivelEducativoId: (updateData as Record<string, unknown>).nivelEducativoId as
      | string
      | undefined,
  };

  const record = await prisma.institucionEducativa.update({
    where: { id },
    data: updatePayload,
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  return mapInstitucion(record);
}
