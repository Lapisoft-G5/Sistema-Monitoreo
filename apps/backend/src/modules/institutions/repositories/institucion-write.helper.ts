import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
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
  const record = await prisma.institucionEducativa.create({
    data: {
      codigoModular: createData.codigoModular,
      codigoLocal: createData.codigoLocal,
      nombre: createData.nombre,
      nivelEducativo: createData.nivelEducativo,
      nivelEducativoId: (createData as any).nivelEducativoId ?? null,
      departamento: createData.departamento ?? 'Puno',
      provincia: createData.provincia,
      distrito: createData.distrito,
      direccion: createData.direccion,
      zona: createData.zona,
      estado: createData.estado ?? EstadoInstitucion.ACTIVA,
      modalidad: createData.modalidad,
    } as any,
    include: INCLUDE_DOCENTE_DIRECTOR,
  });

  if (directorDni) {
    await assignDirector(prisma, record.id, directorDni);
  }

  const reloaded = await prisma.institucionEducativa.findUnique({
    where: { id: record.id },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });

  return mapInstitucion(reloaded || (record as any));
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

  const record = await prisma.institucionEducativa.update({
    where: { id },
    data: {
      ...updateData,
      nivelEducativoId: (updateData as any).nivelEducativoId ?? undefined,
    } as any,
    include: INCLUDE_DOCENTE_DIRECTOR,
  });
  return mapInstitucion(record);
}
