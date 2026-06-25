import { randomUUID } from 'node:crypto';

export async function syncArbolWithTx(
  tx: any,
  plantillaId: string,
  niveles: any[],
  desempenos: any[],
  ejeItems?: any[],
): Promise<void> {
  for (const n of niveles) {
    await tx.nivelCalificacion.create({
      data: {
        id: randomUUID(),
        plantillaId,
        nivelRomano: n.nivelRomano,
        denominacion: n.denominacion,
        rangoMin: n.rangoMin,
        color: n.color,
        orden: n.orden,
      },
    });
  }

  for (const d of desempenos) {
    await tx.desempenoPlantilla.create({
      data: {
        id: d.id,
        plantillaId,
        nombre: d.nombre,
        descripcionCorta: d.descripcionCorta,
        preguntaExtra: d.preguntaExtra,
        orden: d.orden,
        aspectos: {
          create: d.aspectos.map((a: any) => ({
            id: a.id,
            descripcion: a.descripcion,
            orden: a.orden,
          })),
        },
      },
    });

    for (const r of d.rubrica) {
      const nivel = await tx.nivelCalificacion.findFirst({
        where: { plantillaId, nivelRomano: r.nivelRomano },
      });
      if (!nivel) continue;
      await tx.rubricaNivel.create({
        data: {
          desempenoId: d.id,
          nivelCalificacionId: nivel.id,
          descripcion: r.descripcion,
        },
      });
    }
  }

  if (ejeItems) {
    for (const item of ejeItems) {
      await tx.ejeItemPlantilla.create({
        data: {
          id: randomUUID(),
          plantillaId,
          numero: item.numero,
          descripcion: item.descripcion,
          orden: item.orden ?? item.numero,
        },
      });
    }
  }
}
