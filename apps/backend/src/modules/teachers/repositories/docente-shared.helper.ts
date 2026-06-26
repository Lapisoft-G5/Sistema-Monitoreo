import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EstadoRegistro } from '../../../common/enums/estado.enum.js';

export async function checkDirectorConflict(
  tx: any,
  institucionId: string,
  excludeDocenteId?: string,
): Promise<void> {
  const where: any = {
    docente: { institucionId },
    cargo: { nombre: 'Director' },
    fechaFin: null,
  };
  if (excludeDocenteId) {
    where.docenteId = { not: excludeDocenteId };
  }

  const activeDirector = await tx.docenteCargo.findFirst({
    where,
    include: { docente: { include: { persona: true } } },
  });

  if (activeDirector) {
    const p = activeDirector.docente.persona;
    throw new ConflictException(
      `La institución educativa ya cuenta con un director activo (${p.nombres} ${p.apellidos}).`,
    );
  }
}

export async function upsertCurso(
  tx: any,
  prisma: PrismaService,
  cursoAsignado: string,
  nivelEducativo: string,
  docenteId: string,
): Promise<void> {
  const nivel = await prisma.nivelEducativo.findFirst({
    where: { codigo: nivelEducativo, isActive: true },
  });
  const curso = await tx.curso.upsert({
    where: {
      nombre_nivelEducativoId: {
        nombre: cursoAsignado,
        nivelEducativoId: nivel?.id ?? '00000000-0000-0000-0000-000000000000',
      },
    },
    update: {},
    create: {
      nombre: cursoAsignado,
      nivelEducativoId: nivel?.id ?? null,
    },
  });

  await tx.docenteCurso.create({
    data: { docenteId, cursoId: curso.id },
  });
}

export async function syncEspecialista(
  tx: any,
  personaId: string,
  cargoNombre: string,
  nivelEducativo: string,
  condicionLaboral: string | null,
  cargaLaboral: number | null,
  modalidad: string | null,
  escalaMagisterial: number | string | null,
  estado?: string,
): Promise<void> {
  const isMonitor = ['Director', 'Coordinador Pedagógico', 'Jefe de Taller'].includes(cargoNombre);
  const escalaStr = escalaMagisterial != null ? String(escalaMagisterial) : null;
  if (isMonitor) {
    await tx.especialista.upsert({
      where: { personaId },
      update: {
        cargo: cargoNombre,
        nivelEducativo,
        condicionLaboral: condicionLaboral || 'Nombrado',
        cargaLaboral: cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
        estado: estado ?? EstadoRegistro.ACTIVO,
        modalidad: modalidad ?? 'EBR',
        escalaMagisterial: escalaStr,
      },
      create: {
        personaId,
        cargo: cargoNombre,
        nivelEducativo,
        condicionLaboral: condicionLaboral || 'Nombrado',
        cargaLaboral: cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
        estado: estado ?? EstadoRegistro.ACTIVO,
        modalidad: modalidad ?? 'EBR',
        escalaMagisterial: escalaStr,
      },
    });
  } else {
    const existingEsp = await tx.especialista.findUnique({ where: { personaId } });
    if (existingEsp) {
      await tx.especialista.delete({ where: { personaId } });
    }
  }
}

export function resolveRoleCode(cargoNombre: string): string {
  if (cargoNombre === 'Director') return 'director_institucion';
  if (cargoNombre === 'Coordinador Pedagógico') return 'coordinador_pedagogico';
  if (cargoNombre === 'Jefe de Taller') return 'jefe_taller';
  return 'docente';
}
