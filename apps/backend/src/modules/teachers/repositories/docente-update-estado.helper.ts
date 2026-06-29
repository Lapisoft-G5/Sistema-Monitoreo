import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';
import { mapDocente } from './docente-mapper.helper.js';
import { resolveRoleCode } from './docente-shared.helper.js';

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

export async function bajaDirector(prisma: PrismaService, id: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Obtener docente y su persona
    const docente = await tx.docente.findUniqueOrThrow({
      where: { id },
      include: { persona: true },
    });

    // 2. Cerrar cargo activo de Director
    await tx.docenteCargo.updateMany({
      where: { docenteId: id, fechaFin: null },
      data: { fechaFin: new Date() },
    });

    // 3. Cambiar el rol del usuario a 'docente'
    const rolDocente = await tx.rol.findUnique({
      where: { codigo: 'docente' },
    });
    if (rolDocente) {
      await tx.usuario.updateMany({
        where: { personaId: docente.personaId },
        data: { rolId: rolDocente.id },
      });
    }

    // 4. Inactivar el docente y quitar la IE
    const updatedDocente = await tx.docente.update({
      where: { id },
      data: {
        estado: EstadoRegistro.INACTIVO,
        institucionId: null,
      },
      include: DOCENTE_INCLUDE,
    });

    // 5. Inactivar el usuario opcionalmente (o dejarlo activo pero como docente sin IE)
    // Según plan, inactivamos el usuario
    await tx.usuario.updateMany({
      where: { personaId: docente.personaId },
      data: { isActive: false },
    });

    // 6. Si existe especialista, inactivarlo también
    const existingEsp = await tx.especialista.findUnique({
      where: { personaId: docente.personaId },
    });
    if (existingEsp) {
      await tx.especialista.update({
        where: { id: existingEsp.id },
        data: { estado: EstadoRegistro.INACTIVO },
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
