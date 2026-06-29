import { randomUUID } from 'node:crypto';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { CargoRecord } from './especialista.repository.js';

export async function createCargo(
  prisma: PrismaService,
  especialistaId: string,
  cargo: string,
  fechaInicio: Date,
): Promise<CargoRecord> {
  return prisma.$transaction(async (tx) => {
    const created = await tx.especialistaCargo.create({
      data: {
        id: randomUUID(),
        especialistaId,
        cargo,
        fechaInicio,
        fechaFin: null,
        esPrincipal: true,
      },
    });
    await tx.especialista.update({
      where: { id: especialistaId },
      data: { cargo },
    });
    return created;
  });
}

export async function finalizeCargo(
  prisma: PrismaService,
  especialistaId: string,
  cargoId: string,
  fechaFin: Date,
  cargoValue: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.especialistaCargo.update({
      where: { id: cargoId },
      data: { fechaFin },
    });
    await tx.especialista.update({
      where: { id: especialistaId },
      data: { cargo: cargoValue },
    });
  });
}
