import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../shared/prisma/prisma.service.js';

export async function eliminarConCascade(
  prisma: PrismaService,
  id: string,
): Promise<{ id: string; deletedFichas: number }> {
  const exists = await prisma.plantillaMonitoreo.findUnique({ where: { id } });
  if (!exists) throw new NotFoundException(`Plantilla ${id} no encontrada.`);

  return prisma.$transaction(async (tx) => {
    const fichas = await tx.fichaMonitoreo.findMany({
      where: { plantillaId: id },
      select: { id: true, fichaContextoId: true },
    });

    let deletedFichas = 0;
    if (fichas.length > 0) {
      const fichaIds = fichas.map((f) => f.id);

      await tx.fichaRespuestaEjeItem.deleteMany({ where: { fichaId: { in: fichaIds } } });
      await tx.fichaRespuestaAspecto.deleteMany({ where: { fichaId: { in: fichaIds } } });
      await tx.fichaRespuestaDesempeno.deleteMany({ where: { fichaId: { in: fichaIds } } });

      const deleted = await tx.fichaMonitoreo.deleteMany({ where: { plantillaId: id } });
      deletedFichas = deleted.count;

      const contextoIds = fichas.map((f) => f.fichaContextoId);
      await tx.fichaContexto.deleteMany({ where: { id: { in: contextoIds } } });
    }

    await tx.fichaRespuestaDesempeno.deleteMany({
      where: { desempeno: { plantillaId: id } },
    });
    await tx.rubricaNivel.deleteMany({
      where: { desempeno: { plantillaId: id } },
    });
    await tx.aspectoEvaluado.deleteMany({
      where: { desempeno: { plantillaId: id } },
    });
    await tx.desempenoPlantilla.deleteMany({ where: { plantillaId: id } });

    await tx.rubricaNivel.deleteMany({
      where: { nivelCalificacion: { plantillaId: id } },
    });
    await tx.nivelCalificacion.deleteMany({ where: { plantillaId: id } });

    await tx.fichaRespuestaEjeItem.deleteMany({
      where: { ejeItem: { plantillaId: id } },
    });
    await tx.ejeItemPlantilla.deleteMany({ where: { plantillaId: id } });

    await tx.plantillaMonitoreo.delete({ where: { id } });

    return { id, deletedFichas };
  });
}
