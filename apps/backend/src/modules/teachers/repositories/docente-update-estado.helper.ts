import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';
import { mapDocente } from './docente-mapper.helper.js';

const DOCENTE_INCLUDE = {
  persona: true,
  docenteCargos: { include: { cargo: true } },
  docenteCursos: { include: { curso: true } },
  docenteEspecialidades: { include: { especialidad: true } },
  docenteSecciones: true,
} as const;

export async function updateDocenteEstado(prisma: PrismaService, id: string, estado: string) {
  return prisma.$transaction(async (tx) => {
    const docente = await tx.docente.update({
      where: { id },
      data: { estado },
      include: DOCENTE_INCLUDE,
    });

    const existingEsp = await tx.especialista.findUnique({
      where: { personaId: docente.personaId },
    });
    if (existingEsp) {
      await tx.especialista.update({
        where: { id: existingEsp.id },
        data: { estado },
      });
    }

    if (estado === (EstadoRegistro.INACTIVO as string) || estado === 'Inactivo') {
      await tx.usuario.updateMany({
        where: { personaId: docente.personaId },
        data: { isActive: false },
      });
    } else if (estado === (EstadoRegistro.ACTIVO as string) || estado === 'Activo') {
      await tx.usuario.updateMany({
        where: { personaId: docente.personaId },
        data: { isActive: true },
      });
    }

    const fullDocente = await tx.docente.findUniqueOrThrow({
      where: { id },
      include: {
        ...DOCENTE_INCLUDE,
        docenteCargos: { include: { cargo: true }, orderBy: { fechaInicio: 'desc' } },
      },
    });

    return mapDocente(fullDocente);
  });
}
