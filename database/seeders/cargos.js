import { prisma } from './_lib/prisma.js';

/**
 * Cargos: director, subdirector, docente de aula, auxiliar, etc.
 * Se siembra ANTES de personas (los docentes requieren docente_cargo).
 */

const CARGOS = [
  'Director',
  'Subdirector',
  'Docente de Aula',
  'Docente de Educacion Fisica',
  'Auxiliar de Educacion',
  'Jefe de Taller',
  'Coordinador de TOE',
  'Psicologo',
];

export async function seedCargos() {
  console.log('[cargos] Seeding cargos...');
  const cargoMap = {};
  for (const nombre of CARGOS) {
    const cargo = await prisma.cargo.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    cargoMap[nombre] = cargo.id;
  }
  console.log(`[cargos] ${CARGOS.length} cargos listos.`);
  return cargoMap;
}
