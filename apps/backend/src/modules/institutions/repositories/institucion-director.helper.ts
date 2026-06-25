import { ConflictException, BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { INCLUDE_DOCENTE_DIRECTOR } from './institucion-mapper.helper.js';

export async function assignDirector(
  prisma: PrismaService,
  institucionId: string,
  directorDni?: string | null,
): Promise<void> {
  const now = new Date();

  const currentInst = await prisma.institucionEducativa.findUnique({
    where: { id: institucionId },
    include: INCLUDE_DOCENTE_DIRECTOR,
  });

  const currentDirectorDocente =
    currentInst?.docentes?.find((d) =>
      d.docenteCargos?.some((dc) => dc.cargo?.nombre === 'Director' && !dc.fechaFin),
    ) || null;

  const directorCargo = await prisma.cargo.findFirst({
    where: { nombre: 'Director' },
  });

  if (!directorCargo) return;

  if (directorDni) {
    const newDirectorPersona = await prisma.persona.findUnique({
      where: { dni: directorDni },
      include: { docente: true },
    });

    const newDirectorDocente = newDirectorPersona?.docente || null;

    if (!newDirectorPersona || !newDirectorDocente) {
      throw new BadRequestException(
        `No se encontró un docente registrado con el DNI ${directorDni}`,
      );
    }

    const activeDirectorCargo = await prisma.docenteCargo.findFirst({
      where: {
        docenteId: newDirectorDocente.id,
        cargo: { nombre: 'Director' },
        fechaFin: null,
      },
      include: {
        docente: { include: { institucion: true } },
      },
    });

    if (activeDirectorCargo && activeDirectorCargo.docente.institucionId !== institucionId) {
      const schoolName = activeDirectorCargo.docente.institucion?.nombre || 'otra institución';
      throw new ConflictException(`El docente ya es director activo en la I.E. "${schoolName}".`);
    }

    if (currentDirectorDocente && currentDirectorDocente.id === newDirectorDocente.id) return;

    if (currentDirectorDocente) {
      await finalizeCurrentDirector(prisma, currentDirectorDocente, now);
    }

    await prisma.docente.update({
      where: { id: newDirectorDocente.id },
      data: { institucionId },
    });

    await prisma.docenteCargo.updateMany({
      where: { docenteId: newDirectorDocente.id, fechaFin: null },
      data: { fechaFin: now },
    });

    await prisma.docenteCargo.create({
      data: {
        docenteId: newDirectorDocente.id,
        cargoId: directorCargo.id,
        fechaInicio: now,
      },
    });

    await prisma.especialista.upsert({
      where: { personaId: newDirectorPersona.id },
      update: {
        cargo: 'Director',
        nivelEducativo: newDirectorDocente.nivelEducativo,
        condicionLaboral: newDirectorDocente.condicionLaboral || 'Nombrado',
        cargaLaboral: newDirectorDocente.cargaLaboral ?? 40,
        estado: 'Activo',
        modalidad: newDirectorDocente.modalidad,
        escalaMagisterial: newDirectorDocente.escalaMagisterial ?? null,
      },
      create: {
        personaId: newDirectorPersona.id,
        cargo: 'Director',
        nivelEducativo: newDirectorDocente.nivelEducativo,
        condicionLaboral: newDirectorDocente.condicionLaboral || 'Nombrado',
        cargaLaboral: newDirectorDocente.cargaLaboral ?? 40,
        estado: 'Activo',
        modalidad: newDirectorDocente.modalidad,
        escalaMagisterial: newDirectorDocente.escalaMagisterial ?? null,
      },
    });

    const directorRole = await prisma.role.findUnique({
      where: { codigo: 'director_institucion' },
    });
    if (directorRole) {
      await prisma.usuario.updateMany({
        where: { personaId: newDirectorPersona.id },
        data: { rolId: directorRole.id },
      });
    }
  } else {
    if (currentDirectorDocente) {
      await finalizeCurrentDirector(prisma, currentDirectorDocente, now);
    }
  }
}

async function finalizeCurrentDirector(
  prisma: PrismaService,
  currentDocente: { id: string; personaId: string },
  now: Date,
): Promise<void> {
  await prisma.docenteCargo.updateMany({
    where: {
      docenteId: currentDocente.id,
      cargo: { nombre: { in: ['Director', 'Coordinador Pedagógico'] } },
      fechaFin: null,
    },
    data: { fechaFin: now },
  });

  const docenteRole = await prisma.role.findUnique({ where: { codigo: 'docente' } });
  if (docenteRole) {
    await prisma.usuario.updateMany({
      where: { personaId: currentDocente.personaId },
      data: { rolId: docenteRole.id },
    });
  }

  const existingEsp = await prisma.especialista.findUnique({
    where: { personaId: currentDocente.personaId },
  });
  if (existingEsp) {
    await prisma.especialista.delete({
      where: { personaId: currentDocente.personaId },
    });
  }
}
