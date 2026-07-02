import { prisma } from './_lib/prisma.js';

export async function seedUgeles() {
  console.log('--- Ugeles ---');
  let ugel = await prisma.ugel.findUnique({
    where: { codigo: 'UGEL-LAMPA' },
  });

  if (!ugel) {
    ugel = await prisma.ugel.create({
      data: {
        codigo: 'UGEL-LAMPA',
        nombre: 'UGEL Lampa',
        region: 'Puno',
        provincia: 'Lampa',
        isActive: true,
      },
    });
    console.log(`✅ UGEL creada: ${ugel.nombre}`);
  } else {
    console.log(`ℹ️ UGEL ya existe: ${ugel.nombre}`);
  }

  // Actualizar planes y plantillas legacy (con tipoEntidad = 'UGEL' pero sin ugelId)
  await prisma.planMonitoreo.updateMany({
    where: { tipoEntidad: 'UGEL', ugelId: null },
    data: { ugelId: ugel.id },
  });

  await prisma.plantillaMonitoreo.updateMany({
    where: { rolAutorAlCrear: 'jefe_gestion', ugelId: null },
    data: { ugelId: ugel.id },
  });

  return { ugel };
}
